const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

//Default GET Route for Employee
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

//Default POST Route for Employee
menusRouter.post('/', (req, res, next) => {
  //From request message get necessary information to create employee object
    const title = req.body.menu.title;
        
    //Bad request. Request does not contain necessary information
    if (!title) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title)' +
      'VALUES ($title)';
  const values = {
    $title: title,
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

menusRouter.put('/:menuId', (req, res, next) => {
    //From request message get necessary information to create employee object
    const title = req.body.menu.title;
    //Bad request. Request does not contain necessary information
    if (!title) {
        return res.sendStatus(400);
    }

  const sql = 'UPDATE Menu SET title = $title ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $title: name,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const menuItemValues = {$menuId: req.params.menuId};
    db.get(menuItemSql, menuItemValues, (error, menu) => {
      if (error) {
        next(error);
      } else if (menu) {
        res.sendStatus(400);
      } else {
        const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
        const deleteValues = {$menuId: req.params.menuId};
  
        db.run(deleteSql, deleteValues, (error) => {
          if (error) {
            next(error);
          } else {
            res.sendStatus(204);
          }
        });
      }
    });
  });

module.exports = menusRouter;
