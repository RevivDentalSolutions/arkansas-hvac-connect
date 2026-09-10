import {readFileSync,mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import assert from 'node:assert/strict';
import {test} from 'node:test';
const dir=mkdtempSync(join(tmpdir(),'hvac-validation-'));
for(const file of ['partner-routing','lead-validation']){
 const source=readFileSync(new URL('../lib/'+file+'.ts',import.meta.url),'utf8').replace("'./partner-routing'","'./partner-routing.mjs'");
 writeFileSync(join(dir,file+'.mjs'),ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
}
const {validateLead,classifyLead}=await import(pathToFileURL(join(dir,'lead-validation.mjs')));
const valid={name:'Homeowner fixture',phone:'(501) 555-0199',flow:'repair',service:'AC not cooling',city:'Little Rock',zip:'72201',authority:'Homeowner',consent:true};
test('validates and normalizes actual form values',()=>{const p=validateLead(valid);assert.equal(p.phone,'+15015550199');assert.equal(classifyLead(p).service,'AC repair');assert.equal(classifyLead(p).qualification,'qualified');});
test('rejects false string consent, invalid phone, unknown flow and malformed inputs',()=>{for(const p of [{...valid,consent:'false'},{...valid,phone:'123'},{...valid,flow:'anything'},null,[],{...valid,zip:'oops'}])assert.throws(()=>validateLead(p));});
test('test classification cannot be turned off with public flags',()=>{assert.equal(validateLead({...valid,name:'Testing HVAC',isTest:false}).isTest,true);assert.equal(classifyLead(validateLead({...valid,isTest:true})).qualification,'test');});
test('all price categories and normalized service types',()=>{assert.equal(classifyLead(validateLead(valid)).priceKey,'standard_repair');assert.equal(classifyLead(validateLead({...valid,urgency:'Today'})).priceKey,'urgent_repair');assert.equal(classifyLead(validateLead({...valid,flow:'replacement',service:'Replace AC'})).priceKey,'replacement');assert.equal(classifyLead(validateLead({...valid,flow:'replacement',service:'Replace AC',timeline:'0–7 days'})).priceKey,'hot_replacement');assert.equal(classifyLead(validateLead({...valid,service:'Heating not working'})).service,'Heating repair');});
test('unsure or renter requests require review',()=>{assert.equal(classifyLead(validateLead({...valid,service:'Unsure'})).qualification,'review');assert.equal(classifyLead(validateLead({...valid,authority:'Renter'})).qualification,'review');});
