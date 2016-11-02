var records = [
    { id: 1, username: 'wayne1', password: 'abc#123', displayName: 'Wayne', emails: [ { value: 'wayne1@example.com' } ] }
  , { id: 2, username: 'wayne2', password: 'abc#1234', displayName: 'Wayne Vo', emails: [ { value: 'wayne2@example.com' } ] }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}
