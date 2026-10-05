from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math
out=Path('validation/ui-consistency/u1/theme')
font=ImageFont.truetype('../../development/shared/fonts/Comfortaa-Bold.ttf',12)
for label,names in {
 'desktop':['alevel-landing-1440','statistics-1440','teacher-1440','import-1440','olympiad-1440','alevel-dot-and-cross-1440','alevel-electron-configurations-1440','alevel-ph-titration-curves-1440','igcse-bond-enthalpy-1440','igcse-energy-enthalpy-1440','igcse-energetics-practical-1440','alevel-acid-base-calculations-1440'],
 'mobile':['alevel-landing-350','statistics-350','teacher-350','import-350','olympiad-350','alevel-dot-and-cross-350','alevel-electron-configurations-350','alevel-ph-titration-curves-350','igcse-bond-enthalpy-350','igcse-energy-enthalpy-350','igcse-energetics-practical-350','alevel-acid-base-calculations-350'],
 'tablet':['alevel-landing-820','igcse-landing-820','statistics-820','teacher-820','import-820','olympiad-820','alevel-dot-and-cross-820','alevel-electron-configurations-820','alevel-ph-titration-curves-820','igcse-energy-enthalpy-820']}.items():
 w,h,cols=360,480,4
 sheet=Image.new('RGB',(w*cols,h*math.ceil(len(names)/cols)), '#e4e9f2');draw=ImageDraw.Draw(sheet)
 for i,name in enumerate(names):
  im=Image.open(out/(name+'.png')).convert('RGB');im.thumbnail((w-16,h-46));x=(i%cols)*w;y=(i//cols)*h
  sheet.paste(im,(x+(w-im.width)//2,y+38));draw.text((x+8,y+8),name,fill='#142134',font=font)
 sheet.save(out/('contact-'+label+'.png'))
