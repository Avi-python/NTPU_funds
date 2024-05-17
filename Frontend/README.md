# 去中心化募資平台

使用 Daltonic大大 開放的 repo 進行學習 : https://github.com/Daltonic/genesis/
Daltonic 的教學影片 : https://www.youtube.com/watch?v=oizjJKlPwHo&ab_channel=DappMentors

# Advanced

TODO
## 紅利 
使用者投資完，如果項目成立，應該要有一個方式可以給使用者紅利，以感謝投資 :
- 鑄造帶有該項目的一些讀特性的 NFT ( 帶有一個連結可以追蹤後續的進度 )
- 如果使用者擁有這個 NFT 就可連結到該項目，以追蹤這個項目後續的發展進度，或是項目的第一手資料之類的，以這樣的誘因來提升 NFT 的價值。

### 分界線 

#### : 募資項目 ( 可以退款的 )
- TODO : 項目要新增一個「預期完成時間」
- 所以項目的創辦人要不時的上傳一些當前進度以顯示此項目的確有持續進展
  - 如果要求人數超過 2/3 or 之類的，就會成功退款
  - TODO : 人數為多少
- 如果項目一直堅持到某個時間長度過後，就不能要求退款了，也就是到達項目預期的完成時間（需要設置一個下限值，Demo 的時候可以先很低）。
  - TODO : 
    - 項目可能到一半的預期時間後就會先匯一半的款到帳戶裡面
    - 之後在退款的時候就只能每個人都退一半所匯的錢。
  
#### : 捐款項目 ( 錢投進去就回不來 )
- 達標的第一時間就會將錢匯給項目創辦人
- 同樣會鑄造一個 NFT 給他人
- 也同樣可以上傳一些進度提升 NFT 價值，也同時提升項目的名譽價值 ( 應該八 )

#### NFT
- 使用合約 ERC721URIStorage
- 合約會需要一個 array 來儲存該錢包擁有的 NFT
- server 要怎麼驗證一個「某項目的進度資料 request」是來自擁有該項目發送之 NFT 的用戶 : 
  - TODO :
  - 首先合約需要儲存一個 public key mapping 錢包用戶的一個 array ( 這是公開資料沒問題，會在辦好帳號的時候存入新資料 )
  - 使用者先使用他自己的 private key 將自己的錢包 mark 起來和 public key 和項目的 tokenID 一起傳到 server :
    1. server 首先先搜尋這個 public key 存不存在
    2. 使用 public key 驗證錢包的 mark，解開的內容和 public key mapping 到的用戶如果一致，就可以確定傳送這個錢包帳戶的人是使用這個錢包帳戶的本人
    3. 再驗證這個 wallet 的 NFT 裡面所傳送之 tokenID 在裡面。 
    4. 便可以傳送項目進度資料給他。
  - TODO
    - 或是我們也是可以使用 ZK 來證明帳戶的擁有權
      - 就是使用者輸入
        - public key ( public input )
        - private key ( private input )
        - token id ( 我要查詢的項目，不是電路的 input )
      - 最終目標是要 : 證明我有這個 public key，也就可以透過 mapping 知道我有某個 wallet 的擁有權，server 就可以去查詢對應的 tokenID　（要先驗證正這個 wallet 有） 對應的 tokenURT 所對應的項目回傳追蹤進度。


#### TODO : 前後端分離

### TODO : 登入

為了防止很多怪人，和很多廢項目，我們需要做登入機制，會分成兩種登入機制
- 一般的使用信箱登入 : 沒辦法建立投資項目 ( 可能不需要 )
- 需要募資的使用者 : 想要建立投資項目，就需要先讓 server 授權，使用錢包登入

#### public key with ZK
- 使用者建立一對公私鑰
- 公鑰和需要做驗證的圖片、描述等足以證明自己身分的東西發給 server
- 會由平台創辦人閱讀資料看要不要過審
- 過審之後，就會將 public key 寫入 blockchain
- 之後我就可以搭配 ZK
  - 將使用者的 private key 作為電路的 private 輸入
  - 另一個輸入為 public key 則為公開的資料，因為在 chain 裡面
  - 就可以建立需要的證明，將證明傳給需要驗證的對方，對方就可以知道我是已經被驗證的身分
  - 是一個可以建立項目的人，所以 CREATE PROJECT 的時候還需要向創辦人收取一些要驗證 ZK 的錢錢，因為將每一個存在 blockchain 裡面的 public key 驗證
  - 驗證機制 : 
    - 1. 這個 key 在 chain 裡面，代表我這是一個有效的 public key
    - 2. 電路輸入的結果是兩把 key 是配對的，那就證明成功。





## 在每次開始 Demo 之前

1. 重啟 ganache，就是之前鏈上面的資料清除。
2. 但是舊的合約的狀態和地址會留在鏈裡面，所以需要重新佈署一個新的合約上去，使用新的合約地址。
   1. run `yarn hardhat run scripts/deploy.js`
3. MetaMask 刪掉原本的測試鏈 ganache，再重新新增一個測試鏈 (不知道是不是必要，因為 RPC URL 和 ID 都相同)
4. 將每個帳號，執行 `Clear activity tab data` ( This resets the account's nonce and erases data from the activity tab in your wallet )
5. 應該就可以順利執行了

## error : revert ...

在我執行 getProjects 的時候就會出現這個 error，原因就是因為我沒有將 contract 部屬到我自己的 network 裡面，所以抓不到東西。
執行

```bash
yarn hardhat run scripts/deploy.js
```



