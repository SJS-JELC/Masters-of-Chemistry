from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
here=Path(__file__).parent
for batch in range(3):
    canvas=Image.new('RGB',(1500,1120),'white')
    for index in range(12):
        n=batch*12+index+1
        im=Image.open(here/f'model-TC{n:02}.png').convert('RGB')
        # The actual worked-answer screen starts with a heading followed by the rendered model.
        crop=im.crop((0,0,im.width,min(im.height,620)))
        crop.thumbnail((490,260))
        x=(index%3)*500; y=(index//3)*280
        canvas.paste(crop,(x,y))
        ImageDraw.Draw(canvas).text((x+8,y+263),f'TC{n:02}',fill='black')
    canvas.save(here/f'model-contact-{batch+1}.png')
