import express from 'express';
import db from '../db.js';

const router = express.Router();


/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/', (req, res) => {
  db.all('SELECT * FROM roles ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    res.json(rows);
  });
});


/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       400:
 *         description: Role name required or already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Role name is required', errorCode: 'ROLE_NAME_REQUIRED' });

  db.run(
    'INSERT INTO roles (name, description) VALUES (?, ?)',
    [name, description || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Role already exists', errorCode: 'ROLE_EXISTS' });
        }
        return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
      }
      res.json({ id: this.lastID, name, description });
    }
  );
});


/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  db.run(
    'UPDATE roles SET name=?, description=? WHERE id=?',
    [name, description || '', id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
      res.json({ message: 'Role updated' });
    }
  );
});

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete admin role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Don't allow deleting admin role
  if (id === '1') {
    return res.status(400).json({ error: 'Cannot delete admin role', errorCode: 'CANNOT_DELETE_ADMIN_ROLE' });
  }

  db.serialize(() => {
    // Remove role assignments
    db.run('DELETE FROM user_roles WHERE role_id=?', [id]);
    // Remove role permissions
    db.run('DELETE FROM role_permissions WHERE role_id=?', [id]);
    // Delete role
    db.run('DELETE FROM roles WHERE id=?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
      res.json({ message: 'Role deleted' });
    });
  });
});


/**
 * @swagger
 * /api/roles/permissions:
 *   get:
 *     summary: Get all available permissions
 *     responses:
 *       200:
 *         description: List of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/permissions', (req, res) => {
  db.all('SELECT * FROM permissions ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
    res.json(rows);
  });
});


/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   get:
 *     summary: Get permissions for a specific role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of permissions for the role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.get('/:id/permissions', (req, res) => {
  const { id } = req.params;

  db.all(
    `SELECT p.* FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = ?`,
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
      res.json(rows);
    }
  );
});


/**
 * @swagger
 * /api/roles/{id}/permissions:
 *   put:
 *     summary: Update permissions for a specific role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Role permissions updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Permission IDs must be an array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 errorCode:
 *                   type: string
 */
router.put('/:id/permissions', (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ error: 'Permission IDs must be an array', errorCode: 'PERMISSION_IDS_NOT_ARRAY' });
  }

  db.serialize(() => {
    // Remove existing permissions
    db.run('DELETE FROM role_permissions WHERE role_id=?', [id]);
    
    // Add new permissions
    if (permissionIds.length > 0) {
      const stmt = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
      permissionIds.forEach(permissionId => {
        stmt.run(id, permissionId);
      });
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
        res.json({ message: 'Role permissions updated' });
      });
    } else {
      res.json({ message: 'Role permissions updated' });
    }
  });
});

export default router;
