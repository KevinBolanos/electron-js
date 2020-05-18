const { app,  BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

// Recarga las vistas del proyecto sin tener que ejecutar de nuevo npm start
if (process.env.NODE_ENV !== "production") {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    });
}

let mainWindow;
let newProductWindow;

app.on('ready', () => {
    // Definición de ventana y archivo HTML utilizado en ella
    mainWindow = new BrowserWindow({
        webPreferences: 
        {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }));

    // Asignar menú definido
    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    // Cierre en cáscada de ventanas
    mainWindow.on('closed', () => {
        app.quit();
    });

});

// función que llama la ventana de Producto Nuevo
function createNewProduct() {
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 330,
        title: 'Añadir un Producto Nuevo',
        webPreferences: 
        {
            nodeIntegration: true
        }
    });
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }));
    // newProductWindow.setMenu(null); // Menú no aparece
    newProductWindow.on('closed', () => {
        newProductWindow = null;
    });
}

// Recibir datos desde new-product y enviarlos a index
ipcMain.on('new-product', (e, newProduct) => {
    console.log(newProduct);
    mainWindow.webContents.send('new-product', newProduct);
    newProductWindow.close();
});

// Definición del Menú
const templateMenu = [
    {
        label: 'Archivo',
        submenu: [
            {
                label: 'Nuevo Producto',
                accelerator: 'Ctrl+N',
                click() {
                    createNewProduct();
                }
            },
            {
                label: 'Eliminar todos los Productos',
                click() {
                    mainWindow.webContents.send('products-remove-all');
                }
            },
            {
                label: 'Salir',
                accelerator: 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// Nombre de la aplicación en el Menú de un sistema Mac
if(process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName()
    });
}

if(process.env.NODE_ENV !== 'production') {
    templateMenu.push({
        label: 'Devtools',
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}