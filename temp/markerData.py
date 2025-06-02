import csv
import os
from PIL import Image

place = 'dashe'
# 导入图片并获取其分辨率
image_path = './assets/map/'+place+'.webp'  # 替换为你的图片路径
with Image.open(image_path) as img:
    IMAGE_WIDTH, IMAGE_HEIGHT = img.size

# 文件路径
CSV_PATH = './temp/'+place+'.csv'
OUTPUT_PATH = './temp/'+place+'.html'

def to_percent(value, total):
    return round((value / total) * 100, 2)

html_snippets = []

# 转换
type_mapping = {
    'p': 'photo',
    'pb': 'photoboard',
    'i': 'item',
    'c': 'collect',
    'b': 'blackhole'
}

with open(CSV_PATH, newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        x = int(row['x'])
        y = int(row['y'])
        type_ = type_mapping.get(row['type'], row['type'])
        title = row['title']
        image = row['type']+row['image']+'.jpg'
        content = row['content']
        longitude = row['longitude']+'E'
        latitude = row['latitude']+'N'
        where = row['where']

        percent_x = to_percent(x, IMAGE_WIDTH)
        percent_y = to_percent(y, IMAGE_HEIGHT)

        html = f'''
<div class="hotspot" data-left="{percent_x}" data-top="{percent_y}" data-type="{type_}">
  <div class="marker"></div>
  <div class="popup">
    <img src="../assets/photo/{place}/{image}" alt="{title}">
    <div class="popup-content">
      <p class="popup-paragraph">{content}</p>
      <div class="popup-paragraph">
        <p>{latitude} {longitude}</p>
        <p>{where}</p>
      </div>
    </div>
  </div>
</div>
'''.strip()

        html_snippets.append(html)

# 输出到文件
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_snippets))

print(f"✅ 成功生成 {len(html_snippets)} 个热点，保存在 {OUTPUT_PATH}")
