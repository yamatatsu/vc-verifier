[新型コロナワクチン接種証明書アプリ](https://www.digital.go.jp/policies/posts/vaccinecert)で表示できる QR コードが公開されている国際規格であり、中身が JWS だったので verify できるか確かめてみた。

SMART Health Card と呼ばれるものらしい。
https://smarthealth.cards/en/

技術的仕様はこれのとおり
https://spec.smarthealth.cards/

## Usage

```
yarn
yarn verify <your_qrcode_strings>
```
