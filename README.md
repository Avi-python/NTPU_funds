# create environment

## Backend

create the latest python version environment

```shell
pipenv --python python
```

## Frontend
起注意，檔名要改成小寫，因為我本地端是小寫的，大寫可能會出錯


## 重要的 bug

### 為什麼有時候 AddCreator 會不成功 ?
因為前端又不屬新的合約的時候，如果後端沒有重新啟動，所使用的合約是舊的，因此才不會增加到，所以後端也要在部屬新合約之後重開。

### 為什麼 requestReFund 會說還沒有 expiresAt 即便真實世界中，時間已經超過了 
因為當初是使用 block.timestamp 去比較 project.expiresAt，問題會出在一個很猛的地方，由於 block.timestamp 是去取最後一個 block 被創立的時間戳，如果我沒有持續生產新的時間戳，這個時間就不會更新，也就造成一個卡死的狀態，我沒有辦法 request，因為 block.timestamp 的時間太老，但我又沒有產生新的 block 去更新，除非我先去做了別的事情，這個錯誤如果在更多人使用的時候就比較不會發生，因為塊一直在產生。