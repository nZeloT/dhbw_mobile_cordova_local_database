/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        let that = this;

        window.sqlitePlugin.openDatabase({
            name: 'thisIsMyDummyDB.db',
            location: 'default'
        }, function(db) {
            console.log("Database open.")
            that.createTable(db);
        }, function (error){
          document.getElementById("deviceready").appendChild(that.createTextItem("Oo -.- " + error));
        });
    },

    createTable: function(db) {
        let that = this;
        db.transaction(function(tr){
          tr.executeSql('CREATE TABLE IF NOT EXISTS person (firstname, lastname)');
        }, function(error) {
            console.log(error);
        }, function() {
            console.log("Table created");
            that.insertItem(db, "Ich", "Du");
        })
    },

    selectItems: function(db){
        let that = this;
        db.transaction(function(tr){
          tr.executeSql('SELECT firstname, lastname FROM person', [], function (tr, rs) {
              for(let x = 0; x < rs.rows.length; x++) {
                let text = rs.rows.item(x).firstname + ", " + rs.rows.item(x).lastname;
                document.getElementById("deviceready").appendChild(
                        that.createTextItem(text));
              }
          });
        }, function(error){
            console.log(error);
        }, function() {
            that.closeDatabase(db);
        })
    },

    insertItem: function(db, first, last) {
        let that = this;
        console.log("on insert");
      db.transaction(function (tx) {
          console.log("begin insert trans");
        let query = "INSERT INTO person (firstname, lastname) VALUES (?,?)";

        tx.executeSql(query, [first, last], function(tx, res) {
              console.log("insertId: " + res.insertId + " -- probably 1");
              console.log("rowsAffected: " + res.rowsAffected + " -- should be 1");
            },
            function(tx, error) {
              console.log('INSERT error: ' + error.message);
            }
        );

        console.log("query exec");
      }, function(error) {
        console.log('transaction error: ' + error.message);
      }, function() {
        console.log('transaction ok');
        that.selectItems(db);
      });
    },

    closeDatabase: function(db) {
        db.close();
    },

    createTextItem: function(text){
        let node = document.createElement("li");
        let nodeText = document.createTextNode(text);
        node.appendChild(nodeText);
        return node;
    }

};

app.initialize();