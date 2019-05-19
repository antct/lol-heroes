from urllib import request
import requests
import os

mesh_format = 'http://lol.pifupai.com/models/{}_{}.lmesh'
anim_format = 'http://lol.pifupai.com/models/{}_{}.lanim'
json_format = 'http://lol.pifupai.com/models/meta/{}_{}.json'
png_format = 'http://lol.pifupai.com/models/textures/{}/{}.png'
mesh_save = './new_assets/models/{}_{}.lmesh'
anim_save = './new_assets/models/{}_{}.lanim'
png_save = './new_assets/textures/{}/{}.png'
json_save = './new_assets/meta/{}_{}.json'

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


def download(url, save):

    for _ in range(2):
        print(url)
        try:
            pic = requests.get(url)
            if pic.status_code == 200:
                with open(save, 'wb+') as fp:
                    fp.write(pic.content)
            break
        except Exception as e:
            print(e)


for i in nums:
    i = int(i)

    count = 0
    for j in range(0, 30):
        if not os.path.exists('./new_assets/textures/{}'.format(i)):
            os.mkdir('./new_assets/textures/{}'.format(i))

        try:
            download(json_format.format(i, j),
                                json_save.format(i, j))
            c = None
            with open(json_save.format(i, j), 'r') as f:
                # print(f.read()
                c = eval(str(f.read()).replace(
                    'false', 'False').replace('true', 'True'))
            for name in c['meshTextures'].values():
                download(png_format.format(
                    i, name), png_save.format(i, name))
        except Exception as e:
            print('no json {}'.format(e))

        try:
            download(mesh_format.format(i, j),
                                mesh_save.format(i, j))
            try:
                download(anim_format.format(
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
                download(png_format.format(
                    i, name), png_save.format(i, name))
        except Exception as e:
            print(e)
            count += 1
            if count == 2:
                break
            continue
