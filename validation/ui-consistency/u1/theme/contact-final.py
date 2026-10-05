from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
out=Path('validation/ui-consistency/u1/theme');font=ImageFont.truetype('../../development/shared/fonts/Comfortaa-Bold.ttf',12)
for width in [1440,390]:
 names=[f'static-{a}-{width}' for a in ['alevel-acid-base-calculations','alevel-dot-and-cross','alevel-ph-titration-curves','igcse-calorimetry','igcse-bond-enthalpy','alevel-electrons-bonding','alevel-electron-configurations','igcse-energy-enthalpy']]
 sheet=Image.new('RGB',(1440,1000),'#e4e9f2');draw=ImageDraw.Draw(sheet)
 for i,name in enumerate(names):
  source_name=f'ec-axis-static-{width}' if name==f'static-alevel-electron-configurations-{width}' else name
  im=Image.open(out/(source_name+'.png')).convert('RGB');im.thumbnail((348,450));x=(i%4)*360;y=(i//4)*500
  sheet.paste(im,(x+(360-im.width)//2,y+38));draw.text((x+8,y+8),name.removeprefix('static-'),fill='#142134',font=font)
 sheet.save(out/(f'contact-final-{width}.png'))
