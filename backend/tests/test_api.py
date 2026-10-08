import time

import pytest
from fastapi.testclient import TestClient

from app.config import Settings, settings
from app.database import init_db
from app.main import app

client = TestClient(app)


def setup_module():
    init_db()


def get_auth_headers():
    login_res = client.post(
        "/login",
        json={"email": settings.ADMIN_MAIL, "password": settings.ADMIN_PASSWORD},
    )
    token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_swagger_docs_endpoint_is_public():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger" in response.text.lower() or "html" in response.text.lower()


def test_tmdb_models_parsing():
    from app.schemas.tmdb import TMDBFindResponse, TMDBMovieDetails, TMDBTVDetails

    # 1. Test Find
    find_payload = {
        "movie_results": [{"id": 934433, "title": "Scream VI"}],
        "tv_results": [{"id": 1399, "name": "Game of Thrones"}],
    }
    find_res = TMDBFindResponse.model_validate(find_payload)
    assert len(find_res.movie_results) == 1
    assert find_res.movie_results[0]["id"] == 934433

    # 2. Test Movie Details
    movie_payload = {
        "id": 550,
        "title": "Fight Club",
        "release_date": "1999-10-15",
        "vote_average": 8.433,
    }
    movie_res = TMDBMovieDetails.model_validate(movie_payload)
    assert movie_res.id == 550
    assert movie_res.title == "Fight Club"

    # 3. Test TV Details
    tv_payload = {
        "id": 1399,
        "name": "Game of Thrones",
        "number_of_seasons": 8,
        "number_of_episodes": 73,
    }
    tv_res = TMDBTVDetails.model_validate(tv_payload)
    assert tv_res.id == 1399
    assert tv_res.number_of_seasons == 8


def test_settings_crash_on_empty_or_zero():
    with pytest.raises(RuntimeError) as exc_info:
        Settings(_env_file=None, DB_NAME="", PORT=0)  # type: ignore
    assert "FATAL: Application configuration failure" in str(exc_info.value)


def test_login_success():
    response = client.post(
        "/login",
        json={"email": settings.ADMIN_MAIL, "password": settings.ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "access_token" in res_data["data"]
    assert res_data["data"]["token_type"] == "bearer"


def test_login_failure_invalid_credentials():
    response = client.post(
        "/login",
        json={"email": settings.ADMIN_MAIL, "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_protected_routes_unauthorized_without_token():
    # Calling system endpoint without token
    res_root = client.get("/")
    assert res_root.status_code == 401

    res_health = client.get("/health")
    assert res_health.status_code == 401

    # Calling media endpoint without token
    res_media = client.get("/media")
    assert res_media.status_code == 401

    # Calling admin endpoint without token
    res_admin = client.get("/admin/users")
    assert res_admin.status_code == 401


def test_system_endpoints_with_auth():
    headers = get_auth_headers()

    res_root = client.get("/", headers=headers)
    assert res_root.status_code == 200
    assert res_root.json()["data"]["status"] == "running"

    res_health = client.get("/health", headers=headers)
    assert res_health.status_code == 200
    assert res_health.json()["data"]["status"] == "ok"


def test_admin_create_and_list_users():
    headers = get_auth_headers()
    unique_user = f"user_{time.time_ns()}"
    email = f"{unique_user}@example.com"

    # Create user
    res_create = client.post(
        "/admin/create-user",
        json={"username": unique_user, "email": email, "password": "password123"},
        headers=headers,
    )
    assert res_create.status_code == 201
    created_user = res_create.json()["data"]
    assert created_user["username"] == unique_user
    assert created_user["email"] == email

    # Duplicate conflict
    res_dup = client.post(
        "/admin/create-user",
        json={"username": unique_user, "email": email, "password": "password123"},
        headers=headers,
    )
    assert res_dup.status_code == 409

    # List users
    res_list = client.get("/admin/users", headers=headers)
    assert res_list.status_code == 200
    users = res_list.json()["data"]
    assert any(u["username"] == unique_user for u in users)


def test_media_crud_operations(monkeypatch):
    headers = get_auth_headers()
    tmdb_id = int(time.time_ns() % 10000000)

    # Mock fetch_tmdb_details
    def mock_fetch(tid, media_type="movie"):
        return {
            "id": tid,
            "title": "Interstellar",
            "original_title": "Interstellar",
            "poster_path": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
            "overview": "A team of explorers travel through a wormhole in space.",
            "release_date": "2014-11-05",
        }

    monkeypatch.setattr("app.routers.media.fetch_tmdb_details", mock_fetch)

    # 1. Create Media with just tmdb_id & media_type
    media_payload = {
        "tmdb_id": tmdb_id,
        "media_type": "movie",
    }
    create_res = client.post("/media", json=media_payload, headers=headers)
    assert create_res.status_code == 201
    media = create_res.json()["data"]
    media_id = media["id"]
    assert media["title"] == "Interstellar"
    assert media["tmdb_id"] == tmdb_id
    assert media["status"] == "released"

    # 2. Get Media List & by ID
    list_res = client.get("/media?type=movie", headers=headers)
    assert list_res.status_code == 200
    assert any(m["id"] == media_id for m in list_res.json()["data"])

    get_res = client.get(f"/media/{media_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["title"] == "Interstellar"

    # 3. Update Media
    update_res = client.put(
        f"/media/{media_id}", json={"title": "Interstellar (Updated)"}, headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["data"]["title"] == "Interstellar (Updated)"

    # 4. Delete Media
    del_res = client.delete(f"/media/{media_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Verify 404
    not_found_res = client.get(f"/media/{media_id}", headers=headers)
    assert not_found_res.status_code == 404
