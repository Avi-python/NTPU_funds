# create environment

如果想要嘗試執行這個專案，請照以下步驟嘗試看看

## GanacheUI

1. 創建一個新的環境 ( work space )

2. 在 metaMask 登入這個網路，使用「 url 位址」和「鏈 ID」

3. 選取自己要用的幾個錢包帳號，並選取一個做為部屬合約的 App Owner

4. 需再兩個地方調整鏈的 url
   
- hardhat.config.js : 將裡面 localhost.url 改成這個鏈的 url
- 在 Backend/backend/settings.py 裡面有一個 BLOCKCHAIN_URL，改成這個鏈的 url

## Backend

1. create the latest python version environment

```shell
pipenv --python python
```

2. cd 進入 Backend/backend 目錄下，再進入虛擬環境中

```shell
pipenv shell
```

3. 下載依賴
   
```shell
pipenv install
```

4. 同樣在 Backend/backend 目錄下，分別執行以下兩個指令

```shell
python manage.py makemigrations
```

```shell
python manage.py migrate
```

建立模型和 data base

5. 建立一個 .env file 在 Backend/backend 目錄下，要填寫的內容如下

放入你要作為「AppOwner」的錢包 address，及其 private key。( private key 前面哪個 0x 不要寫，後面的內容就好 )

```plain
ACCOUNT_PRIVATE_KEY="8502a5282bec6a2db9cab10baed69503705acfa3356ff76aa40454a95453b830"
ACCOUNT="0x8fbEf15EbAF7129959eFFedbcd409F26483Ce114" 
```

6. 照著以上配置完，應該就可以運行後端了

```shell
python manage.py runserver
```

## Frontend

1. 注意，目錄名改成小寫，因為我本地端是小寫的，大寫可能會出錯 : Frontend -> frontend

2. cd 到 frontend 目錄，下載依賴

```shell
yarn install
```

可能會遇到一些神祕的錯誤，我自己的作法是，從同一個一個將依賴 `yarn add <dependency name>` 進來，雖然暴力、費時但有用。

3. 在 frontend 目錄建立 .env file，填寫內容如下 : 

- 後端 server 的 url    
- 和後端作為 app Owner 的錢包 address 同個，填入其 private key。
- 
```plain
REACT_APP_SERVER_URL="http://localhost:8000"
APP_OWNER_PRIVATE_KEY="8502a5282bec6a2db9cab10baed69503705acfa3356ff76aa40454a95453b830"
```

4. 啟動 ganache UI，並在 frontend 目錄下執行以下指令部屬合約

```shell
yarn hardhat run scripts/deploy.js
```
應該要有 compile 成功以及部屬過程內容（合約地址，合約 owner 地址）跳出來

5. 照著上面步驟如果成功，應該就可以執行了 (在 frontend 目錄下)

```shell
yarn start
```

## 特別注意

1.  Ganach-UI 一定要第一個啟動 ( 這樣才可以部屬合約 )
2.  再來是部屬合約的部分，這樣我們才可以有最新的合約地址可以索取
3.  最後則是啟動 前端 ( `yarn start` ) 和 後端 ( `python manage.py runserver` )。


