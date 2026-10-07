/* eslint-disable camelcase */
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const { JWT_SECRET } = process.env;
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { hashPassword, comparePassword } = require('../utils/encryption');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       required:
 *         - tmdb_id
 *         - media_type
 *         - title
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant unique en base de données
 *           example: 1
 *         tmdb_id:
 *           type: integer
 *           description: Identifiant TMDB
 *           example: 550
 *         media_type:
 *           type: string
 *           enum: [movie, tv]
 *           description: Type de média
 *           example: movie
 *         title:
 *           type: string
 *           description: Titre principal
 *           example: Fight Club
 *         original_title:
 *           type: string
 *           nullable: true
 *           example: Fight Club
 *         poster_path:
 *           type: string
 *           nullable: true
 *           example: /pB8OverwYvBv2wR13aB85.jpg
 *         overview:
 *           type: string
 *           nullable: true
 *           example: A ticking-time-bomb insomniac...
 *         release_date:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 1999-10-15
 *         season_number:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         episode_number:
 *           type: integer
 *           nullable: true
 *           example: 10
 *         next_air_date:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 2026-11-01
 *         status:
 *           type: string
 *           enum: [upcoming, released, available]
 *           default: upcoming
 *           example: upcoming
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: 2026-10-07T12:00:00Z
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: admin
 *         email:
 *           type: string
 *           example: admin@example.com
 *         is_admin:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@example.com
 *         password:
 *           type: string
 *           example: admin
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: secret123
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Statut de l'API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: L'API fonctionne normalement
 */
router.get('/', (req, res) =>
  successResponse(res, { status: 'running' }, 'The backend API is running !')
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérification de l'état de santé
 *     tags: [System]
 *     responses:
 *       200:
 *         description: L'API est en bonne santé
 */
router.get('/health', (req, res) =>
  successResponse(res, { status: 'ok' }, 'The backend API is healthy !')
);

// --- JWT ROUTES ---

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification utilisateur et génération de token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Connexion réussie, renvoie le token JWT
 *       400:
 *         description: Email et mot de passe requis
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400, 'BAD_REQUEST');
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await comparePassword(password, user.password_hash))) {
    return errorResponse(res, 'Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return successResponse(res, { token }, 'User logged in successfully', 200);
});

// --- ADMIN ROUTE ---

/**
 * @swagger
 * /admin/create-user:
 *   post:
 *     summary: Créer un nouvel utilisateur (Admin)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Champs obligatoires manquants
 *       409:
 *         description: Un utilisateur existe déjà avec cet email ou nom d'utilisateur
 */
router.post('/admin/create-user', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return errorResponse(res, 'Missing required fields: username, email, and password', 400, 'BAD_REQUEST');
  }

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existingUser) {
    return errorResponse(res, 'User with this email or username already exists', 409, 'CONFLICT');
  }

  const hashedPassword = hashPassword(password);
  const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
  const result = stmt.run(username, email, hashedPassword);

  const newUser = db.prepare('SELECT id, username, email, is_admin, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  return successResponse(res, newUser, 'User registered successfully', 201);
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Obtenir la liste de tous les utilisateurs (Admin)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 */
router.get('/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, username, email, is_admin, created_at FROM users').all();
  return successResponse(res, users, 'Users retrieved successfully');
});

// --- MEDIA ROUTES ---

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Obtenir la liste des médias suivis
 *     tags: [Medias]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [movie, tv]
 *         description: Filtrer par type (film ou série)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, released, available]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des médias récupérée
 */
router.get('/media', (req, res) => {
  const { type, status } = req.query;

  let sql = 'SELECT * FROM medias WHERE 1=1';
  const params = {};

  if (type) {
    sql += ' AND media_type = @type';
    params.type = type;
  }
  if (status) {
    sql += ' AND status = @status';
    params.status = status;
  }
  sql += ' ORDER BY created_at DESC';
  const medias = db.prepare(sql).all(params);
  return successResponse(res, medias, 'Medias retrieved successfully');
});

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Obtenir un média par son identifiant
 *     tags: [Medias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique du média
 *     responses:
 *       200:
 *         description: Média trouvé
 *       404:
 *         description: Média non trouvé
 */
router.get('/media/:id', (req, res) => {
  const media = db.prepare('SELECT * FROM medias WHERE id = ?').get(req.params.id);
  if (!media) {
    return errorResponse(res, 'Media not found', 404, 'NOT_FOUND');
  }
  return successResponse(res, media, 'Media retrieved successfully');
});

/**
 * @swagger
 * /media:
 *   post:
 *     summary: Ajouter un nouveau média à suivre
 *     tags: [Medias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Media'
 *     responses:
 *       201:
 *         description: Média créé avec succès
 *       400:
 *         description: Champs obligatoires manquants (tmdb_id, media_type, title)
 *       409:
 *         description: Ce média existe déjà dans la base (tmdb_id unique)
 */
router.post('/media', (req, res) => {
  const {
    tmdb_id,
    media_type,
    title,
    original_title = null,
    poster_path = null,
    overview = null,
    release_date = null,
    season_number = null,
    episode_number = null,
    next_air_date = null,
    status = 'upcoming',
  } = req.body;

  if (!tmdb_id || !media_type || !title) {
    return errorResponse(res, 'Missing required fields: tmdb_id, media_type, and title', 400, 'BAD_REQUEST');
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO medias (
        tmdb_id, media_type, title, original_title, poster_path,
        overview, release_date, season_number, episode_number, next_air_date, status
      ) VALUES (
        @tmdb_id, @media_type, @title, @original_title, @poster_path,
        @overview, @release_date, @season_number, @episode_number, @next_air_date, @status
      )
    `);

    const result = stmt.run({
      tmdb_id,
      media_type,
      title,
      original_title,
      poster_path,
      overview,
      release_date,
      season_number,
      episode_number,
      next_air_date,
      status,
    });

    const newMedia = db.prepare('SELECT * FROM medias WHERE id = ?').get(result.lastInsertRowid);
    return successResponse(res, newMedia, 'Media created successfully', 201);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return errorResponse(res, 'Media with this tmdb_id already exists', 409, 'CONFLICT');
    }
    throw err;
  }
});

/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Mettre à jour un média existant
 *     tags: [Medias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique du média à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Media'
 *     responses:
 *       200:
 *         description: Média mis à jour avec succès
 *       404:
 *         description: Média non trouvé
 */
router.put('/media/:id', (req, res) => {
  const media = db.prepare('SELECT * FROM medias WHERE id = ?').get(req.params.id);
  if (!media) {
    return errorResponse(res, 'Media not found', 404, 'NOT_FOUND');
  }

  const {
    tmdb_id,
    media_type,
    title,
    original_title = null,
    poster_path = null,
    overview = null,
    release_date = null,
    season_number = null,
    episode_number = null,
    next_air_date = null,
    status = 'upcoming',
  } = req.body;

  const stmt = db.prepare(`
    UPDATE medias SET
      tmdb_id = @tmdb_id,
      media_type = @media_type,
      title = @title,
      original_title = @original_title,
      poster_path = @poster_path,
      overview = @overview,
      release_date = @release_date,
      season_number = @season_number,
      episode_number = @episode_number,
      next_air_date = @next_air_date,
      status = @status
    WHERE id = @id
  `);

  stmt.run({
    id: req.params.id,
    tmdb_id,
    media_type,
    title,
    original_title,
    poster_path,
    overview,
    release_date,
    season_number,
    episode_number,
    next_air_date,
    status,
  });

  const updatedMedia = db.prepare('SELECT * FROM medias WHERE id = ?').get(req.params.id);
  return successResponse(res, updatedMedia, 'Media updated successfully');
});

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Supprimer un média
 *     tags: [Medias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique du média
 *     responses:
 *       200:
 *         description: Média supprimé avec succès
 *       404:
 *         description: Média non trouvé
 */
router.delete('/media/:id', (req, res) => {
  const media = db.prepare('SELECT * FROM medias WHERE id = ?').get(req.params.id);
  if (!media) {
    return errorResponse(res, 'Media not found', 404, 'NOT_FOUND');
  }
  db.prepare('DELETE FROM medias WHERE id = ?').run(req.params.id);
  return successResponse(res, null, 'Media deleted successfully');
});

module.exports = router;
