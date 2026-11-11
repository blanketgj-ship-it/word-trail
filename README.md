# Word Trail · 本地版

在线游玩：https://blanketgj-ship-it.github.io/word-trail/ 。无需登录。

## 启动

双击 start.cmd 或 index.html，可离线游玩，无需登录或安装依赖。

本地服务器：`node server.cjs`，默认 http://localhost:3001。
逻辑测试：`node verify.cjs`。

## 玩法

- 24 个话题，英文和中文使用独立词库，界面可切换。
- 英文按 A–Z 排序，中文按拼音排序；猜测记录使用同样的顺序。
- 距离是当前话题词库中的位置差，相邻词相差 1 位。
- 一个字符的增、删、改、相邻颠倒可容错，匹配多个词时由玩家选择。
- 英文姓名和片名支持空格、连字符、重音和标点的宽松匹配。
- 菜单可切换话题、查找词库、开始新一局；提示按钮揭示字母或汉字。

## 词库来源

见 SOURCES.md 和 licenses/。这不是牛津全量词库。

重建词库：将 NLTK 分发的 wordnet.zip 和 omw-1.4.zip 解压到父目录的 .local-data/ 下，然后运行 `node scripts/build-vocabulary.cjs`。
新增经授权的数据可补入 scripts/curated.cjs 的对应话题，并重新生成 vocabulary.js。保留源数据许可说明。
