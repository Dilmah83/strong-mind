import {spawnSync} from 'node:child_process';
for(const file of ['test/model.test.js','test/v2.test.js']){
 const result=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
