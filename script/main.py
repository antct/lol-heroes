from urllib import request
import requests
import os

mesh_format = 'http://lol.pifupai.com/models/{}_{}.lmesh'
anim_format = 'http://lol.pifupai.com/models/{}_{}.lanim'
json_format = 'http://lol.pifupai.com/models/meta/{}_{}.json'
png_format = 'https://media.services.zam.com/v1/media/byName/mvx/lol/{}/{}/{}.png'
mesh_save = './assets/models/{}_{}.lmesh'
anim_save = './assets/models/{}_{}.lanim'
png_save = './assets/textures/{}/{}.png'
json_save = './assets/meta/{}_{}.json'

content = None
with open('./assets/raw_hero.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
nums = re.findall('<option value="(.*?)">.*?</option>', content)
names = re.findall('<option value=".*?">(.*?)</option>', content)
name_dic = {nums[i]: names[i] for i in range(len(nums))}
name_dic1 = {names[i]: nums[i] for i in range(len(nums))}
skin_dic = {}

count = 0
for i in nums:
    i = int(i)
    res = requests.get('http://lol.pifupai.com/3dmodels?champion={}'.format(i))
    op = re.findall('<option value="0">默认皮肤.*</option>', res.text)[0]
    skins = re.findall('<option value=".*?">(.*?)</option>', op)
    skin_dic[str(i)] = skins
    for j in range(0, 30):
        if not os.path.exists('./assets/textures/{}'.format(i)):
            os.mkdir('./assets/textures/{}'.format(i))

        try:
            request.urlretrieve(json_format.format(i, j),
                                json_save.format(i, j))
            c = None
            with open(json_save.format(i, j), 'r') as f:
                # print(f.read())
                c = eval(str(f.read()).replace(
                    'false', 'False').replace('true', 'True'))
            for name in c['meshTextures'].values():
                request.urlretrieve(png_format.format(
                    i, j, name), png_save.format(i, name))
        except Exception as e:
            print('no json {}'.format(e))

        try:
            request.urlretrieve(mesh_format.format(i, j),
                                mesh_save.format(i, j))
            try:
                request.urlretrieve(anim_format.format(
                    i, j), anim_save.format(i, j))
            except Exception as e:
                print("anim not exists {}".format(e.code))

            with open(mesh_save.format(i, j), 'rb') as f:
                c = str(f.read())[0:100]
                c = re.sub('\\\\x..', '\\\\x', c)
                c = c.split('\\x')
                c = [i for i in c if len(i)]

                # index = c.index('{}_{}'.format(i, j))
                name = c[3].replace('\n', '')
                print(name)
                request.urlretrieve(png_format.format(
                    i, j, name), png_save.format(i, name))
        except Exception as e:
            print(e)
            break

with open('./assets/index2name.json', 'w+', encoding='utf-8') as f:
    f.write(str(name_dic).replace("'", '"'))
with open('./assets/name2index.json', 'w+', encoding='utf-8') as f:
    f.write(str(name_dic1).replace("'", '"'))
with open('./assets/index2skin.json', 'w+', encoding='utf-8') as f:
    f.write(str(skin_dic).replace("'", '"'))
