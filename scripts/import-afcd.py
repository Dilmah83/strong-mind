"""Import official AFCD Release 3 XLSX files (Python standard library only).
Usage: python scripts/import-afcd.py /path/nutrients.xlsx /path/food-details.xlsx
Data: FSANZ Data User Licence, based on CC BY-SA 3.0 AU; see docs/DATA-SOURCES.md.
"""
import sys,json,re,zipfile,xml.etree.ElementTree as E
N={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def rows(path,sheet='sheet2.xml'):
 z=zipfile.ZipFile(path);ss=[''.join(x.itertext()) for x in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',N)]
 out=[]
 for r in E.fromstring(z.read('xl/worksheets/'+sheet)).findall('.//s:row',N)[3:]:
  d={}
  for c in r:
   v=c.find('s:v',N)
   if v is not None:d[re.sub(r'\d','',c.attrib['r'])]=ss[int(v.text)] if c.attrib.get('t')=='s' else v.text
  if d.get('A'):out.append(d)
 return out
cols={'protein':'H','carbs':'AN','fat':'J','fibre':'L','sugar':'T','saturatedFat':'EB','iodine':'BJ','calcium':'BD','iron':'BK','magnesium':'BM','potassium':'BS','selenium':'BT','sodium':'BU','zinc':'BX','vitaminA':'CD','b1':'CH','b2':'CI','b3':'CJ','b6':'CN','b12':'CP','folate':'CS','vitaminC':'CU','vitaminE':'DI'}
details={r['A']:r for r in rows(sys.argv[2])};result=[]
for r in rows(sys.argv[1]):
 n={}
 for k,col in cols.items():
  try:
   v=float(r[col])
   if v>=0:n[k]=v
  except (ValueError,KeyError):pass
 try:n['calories']=round(float(r['E'])/4.184,3)
 except (ValueError,KeyError):pass
 # D2 + D3 only; do not equate vitamin D3 equivalents (including metabolites) with total D.
 try:n['vitaminD']=float(r['CV'])+float(r['CW'])
 except (ValueError,KeyError):pass
 d=details.get(r['A'],{});f={'id':'afcd-'+r['A'],'name':r['D'],'nutrients':n,'source':'FSANZ AFCD Release 3','sourceId':r['A'],'sourceUrl':'https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd','confidence':r['C'],'basis':'g','description':d.get('E',''),'nutrientBasis':'Vitamin A: retinol equivalents; folate: total folates; vitamin D: D2 + D3. Source derivation may include imputation or borrowed data.'}
 try:
  density=float(d['I'])
  if density>0:f['density']=density;f['densitySource']='FSANZ specific gravity (approximate g/mL)'
 except (ValueError,KeyError):pass
 result.append(f)
open('public/data/afcd.json','w').write(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print('Imported',len(result),'official Australian foods')
