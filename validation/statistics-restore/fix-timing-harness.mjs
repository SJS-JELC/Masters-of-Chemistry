import fs from 'node:fs';const file='validation/statistics-restore/timing-browser.mjs';fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace("name:'Check answer'","name:'Check'"));
