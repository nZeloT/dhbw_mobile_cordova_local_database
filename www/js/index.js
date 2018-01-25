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

var db = null;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        document.getElementById('selectBtn').addEventListener('click', uiController.handleSelect.bind(uiController), false);
        document.getElementById('insertBtn').addEventListener('click', uiController.prepareInsert.bind(uiController), false);
        document.getElementById('openBtn').addEventListener('click', this.onDeviceReady.bind(this), false);
        document.getElementById('closeBtn').addEventListener('click', this.closeDatabase.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
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
    },

    createTable: function() {
        let that = this;
        db.transaction(function(tr){
          tr.executeSql('CREATE TABLE IF NOT EXISTS person (firstname, lastname)');
        }, function(error) {
            console.log(error);
        }, function() {
            console.log("Table created");
            uiController.databaseOpened();
        })
    },

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
    },

    insertItem: function(first, last) {
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
        console.log('Insert Okay');
      });
    },

    closeDatabase: function() {
        db.close();
        uiController.databaseClosed();
    },

    createTextItem: function(text){
        let node = document.createElement("li");
        let nodeText = document.createTextNode(text);
        node.appendChild(nodeText);
        return node;
    }

};

var uiController = {
    databaseOpened: function(){
      document.getElementById('openBtn').disabled = true;
      document.getElementById('closeBtn').disabled = false;
      document.getElementById('selectBtn').disabled = false;
      document.getElementById('insertBtn').disabled = false;
      document.getElementById('firstname').disabled = false;
      document.getElementById('lastname').disabled = false;
    },

    databaseClosed: function() {
      document.getElementById('openBtn').disabled = false;
      document.getElementById('closeBtn').disabled = true;
      document.getElementById('selectBtn').disabled = true;
      document.getElementById('insertBtn').disabled = true;
      document.getElementById('firstname').disabled = true;
      document.getElementById('lastname').disabled = true;
    },

    prepareInsert: function() {
      let first = document.getElementById('firstname').value;
      let last = document.getElementById('lastname').value;

      console.log(first, last);

      app.insertItem(first, last);
    },

    handleSelect: function(){
      this.clearSelection();
      app.selectItems();
    },

    clearSelection: function() {
      let selectNode = document.getElementById('selectresults');
      selectNode.innerHTML = '';
    }
};

app.initialize();