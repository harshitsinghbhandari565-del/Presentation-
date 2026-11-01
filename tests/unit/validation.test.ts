import test from "node:test";
import assert from "node:assert/strict";
import { documentInputSchema, formDataToDocumentInput } from "../../src/lib/document-validation";
const valid = { title:"Useful study notes",slug:"useful-study-notes",description:"A helpful set of notes for students.",original_url:"https://drive.google.com/file/d/id/view",platform:"Google Drive",subject_id:"550e8400-e29b-41d4-a716-446655440000",course_id:"",semester:"",topic:"Chapter 1",document_type:"Notes",thumbnail_url:"",keywords:"notes, revision",tags:"english",is_featured:false,publication_status:"draft",presentation_url:"",embed_url:"",backup_links:[] };
test("accepts a validated draft without requiring invented optional metadata",()=>assert.equal(documentInputSchema.safeParse(valid).success,true));
test("rejects unsafe links, arbitrary embeds and invalid taxonomy IDs",()=>{
  for(const patch of [{original_url:"javascript:alert(1)"},{embed_url:"https://evil.example/embed"},{subject_id:"not-a-uuid"},{publication_status:"private"},{slug:"../../admin"},{keywords:Array.from({length:21},(_,i)=>`term${i}`).join(",")}]) assert.equal(documentInputSchema.safeParse({...valid,...patch}).success,false);
});
test("form conversion preserves checkbox semantics and rejects malformed backup JSON",()=>{
  const form=new FormData(); Object.entries(valid).forEach(([key,value])=>form.set(key,typeof value==="boolean"?(value?"on":"off"):String(value))); form.set("backup_links",JSON.stringify([{label:"Backup",platform:"Dropbox",url:"https://www.dropbox.com/scl/fi/id/file.pdf"}]));
  assert.equal(formDataToDocumentInput(form).success,true); form.set("backup_links","{"); assert.equal(formDataToDocumentInput(form).success,false);
});
test("rejects excessive backup count",()=>assert.equal(documentInputSchema.safeParse({...valid,backup_links:Array.from({length:6},()=>({label:"Backup",platform:"Dropbox",url:"https://www.dropbox.com/file"}))}).success,false));
