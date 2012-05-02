sys = require 'util' 
exec = require('child_process').exec
fs = require 'fs'

exports.precompile = (dir) -> 
  console.log "#{dir}"
  fs.readdir dir, (err, files) ->
    console.log "Error: #{err}" if err?
    compileCoffee dir + '/' + file for file in files when file.match /.coffee$/


compileCoffee = (file) ->
  exec "coffee -c #{file}", output

output = (err, stdout, stderr) ->
  sys.puts stdout
