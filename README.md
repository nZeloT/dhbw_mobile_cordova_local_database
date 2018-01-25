# Lokale Datenbank mit SQLite

## Was ist SQLite?
SQLite ist eine Programmbibliothek die einen großteil des SQL-92 Standarts implementiert. Das heißt man erhält hier die Möglichkeit Daten in einem relationalen Schema abzulegen ohne einen vollständiges DBMS im Hintergrund laufen zu haben. Es werden unter anderem Transaktionen und Views unterstützt. Es gibt allerdings kein Build-In User und Autorisierungsmanagement. SQLite wird beispielsweise bei Firefox zum Ablegen der Lesezechen, sowie in Safari und Apple Mail verwendet.

## Installation des Plugins
Zur Nutzung von SQLite innerhalb einer Cordova App gibt es das Plugin [Cordova-sqlite-storage](https://github.com/litehelpers/Cordova-sqlite-storage)
Zur Installation des Plugins innerhalb eines bereits erstellten App Projektes den Befehl:
```
cordova plugin add cordova-sqlite-storage --save
```
**Hinweis: das Plugin funktioniert nicht im Browser!**

## Verwenden des Plugins
Alle Funktionen des Plugins sind grundsätzlich verfügbar unter
```javascript
window.sqlitePlugin
```
### Datenbank Erstellen / Öffnen
Um eine neue Datenbank zu öffnen/zu erstellen verwende:
```javascript
var db = window.sqlitePlugin.openDatabase({name: 'my.db', location: 'default'}, successcb, errorcb);
```
Wenn die Datenbankdatei nicht gefunden wird, dann wird eine neue Angelegt. Unter Android kann die Location nicht weiter spezifiziert werden. Für iOS kann man noch spezifizieren ob man eine iCloud synchronisierung bzw. Anzeige in iTunes wünscht. Siehe dazu [iOS Location configuration](https://github.com/litehelpers/Cordova-sqlite-storage#opening-a-database).

### CRUD Operationen
Zur Ausführung von SQL Statements gibt es drei Optionen: Single Statement Transaktionen, Batch Transaktionen sowie Asynchrone Transaktionen

#### Single Statement Transaktionen
Hierbei wird immer genau ein SQL Statement ausgeführt
```javascript
db.executeSql('INSERT INTO MyTable VALUES (?)', ['test-value'], function (resultSet) {
  console.log('resultSet.insertId: ' + resultSet.insertId);
  console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
}, function(error) {
  console.log('SELECT error: ' + error.message);
});
```

#### Batch Transaktionen
Hierbei können mehrere einzelnen Statements hintereinander ausgeführt werden
```javascript
db.sqlBatch([
  'DROP TABLE IF EXISTS MyTable',
  'CREATE TABLE MyTable (SampleColumn)',
  [ 'INSERT INTO MyTable VALUES (?)', ['test-value'] ],
], function() {
  db.executeSql('SELECT * FROM MyTable', [], function (resultSet) {
    console.log('Sample column value: ' + resultSet.rows.item(0).SampleColumn);
  });
}, function(error) {
  console.log('Populate table error: ' + error.message);
});
```

#### Asynchrone Transaktionen
Hier kann innerhalb der Transaktion ebenfalls eine beliebige Menge von Statements ausgeführt werden. Jedoch ist, wie der Name schon sagt, der Aufruf non-blocking und erfolgt asynchron. Deshalb gibt es an dieser stelle auch eine Success Callback.
```javascript
db.transaction(function(tx) {
  tx.executeSql('DROP TABLE IF EXISTS MyTable');
  tx.executeSql('CREATE TABLE MyTable (SampleColumn)');
  tx.executeSql('INSERT INTO MyTable VALUES (?)', ['test-value'], function(tx, resultSet) {
    console.log('resultSet.insertId: ' + resultSet.insertId);
    console.log('resultSet.rowsAffected: ' + resultSet.rowsAffected);
  }, function(tx, error) {
    console.log('INSERT error: ' + error.message);
  });
}, function(error) {
  console.log('transaction error: ' + error.message);
}, function() {
  console.log('transaction ok');
});
```

Detaillierter Informationen zu den verschiedenen Statement Execution Möglichkeiten liefert die [Offizielle Dokumentation](https://github.com/litehelpers/Cordova-sqlite-storage#sql-transactions)

### Datenbank schließen

Wenn die Datenbank nichtmehr gebraucht wird, sollte sie geschlossen werden um Datenverlust zu verhindern.
```javascript
db.close(successcb, errorcb);
```
Detaillierter Informationen bietet auch hier die [Offizielle Dokumentation](https://github.com/litehelpers/Cordova-sqlite-storage#close-a-database-object)

## Demo App

Die in diesem Repository bereitgestellte Demo App setzt konsistent auf asynchrone Transaktionen, auch wenn es nicht unbedingt notwendig wäre.

### Screenahots
<p align="center">
  <img src="/app_pics/startScreen.PNG" width="250"/>
  <img src="/app_pics/afterSelect.PNG" width="250"/>
  <img src="/app_pics/afterClose.PNG" width="250"/>
</p><br>
<p align="center">
  <img src="/app_pics/whileInsert.PNG" width="250"/>
  <img src="/app_pics/afterInsert.PNG" width="250"/>
</p>

### Funktionalität
Die App bietet verschiedene Buttons, die verschiedene Funktionen ansteuern. Sobald das Device bereit ist wird automatisch eine Datenbank geöffnet.
```javascript
onDeviceReady: function() {
        let that = this;

        db = window.sqlitePlugin.openDatabase({
            name: 'thisIsMyDummyDB.db',
            location: 'default'
        }, function(db) {
            console.log("Database open.");
            that.createTable();
        }, function (error){
          console.log(error);
        });
    }
```

Beim Initialisieren der App werden die Button Events außerdem verschiedenen Controller Funktionen zugeordnet.
```javascript
initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        document.getElementById('selectBtn').addEventListener('click', uiController.handleSelect.bind(uiController), false);
        document.getElementById('insertBtn').addEventListener('click', uiController.prepareInsert.bind(uiController), false);
        document.getElementById('openBtn').addEventListener('click', this.onDeviceReady.bind(this), false);
        document.getElementById('closeBtn').addEventListener('click', this.closeDatabase.bind(this), false);
    }
```

Beim Selektieren der Einträge von der Datenbank wird zuvor die vorherige Slektionsliste gelöscht. Entscheident hierbei scheint es auch zu sein, die gewünschten Spalten der tabelle explizit zu nennen.
```javascript
selectItems: function(){
        let that = this;
        db.transaction(function(tr){
          tr.executeSql('SELECT firstname, lastname FROM person', [], function (tr, rs) {
              for(let x = 0; x < rs.rows.length; x++) {
                let text = rs.rows.item(x).firstname + ", " + rs.rows.item(x).lastname;
                document.getElementById("selectresults").appendChild(
                        that.createTextItem(text));
              }
          });
        }, function(error){
            console.log(error);
        }, function() {
            console.log("Select Okay");
        })
    }
```

Alle weiteren Funktionalitäten können in der ``index.js`` nachgelesen werden.
