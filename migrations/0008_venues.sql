-- events.location(自由記述)の表記ゆれ(半角/全角、スペース有無、「イベント
-- スペース」等の接尾辞違いなど)を解消するため、venues テーブルを新設して
-- events.venue_id で参照する形にする。
--
-- events.location は今回は削除しない(突き合わせ用に残す)。アプリ側はもう
-- 参照しない。削除は検証後に別migrationで行う。
--
-- 名寄せ(どの文字列がどの会場に統合されるか)は手動レビュー済み。同じビル
-- 内でも別ステージ/別フロアは別会場として区別している
-- (例: GOTANDA G4とG7、HMV＆BOOKS SHIBUYAの5Fと6F)。
-- 一方で「タワーレコード渋谷店 5F」「5階」「5階イベントスペース」のような
-- 単純な表記ゆれは1つの会場に統合した。

create table if not exists venues (
  id bigint generated always as identity primary key,
  name text not null unique
);

alter table venues enable row level security;
create policy "Public read access" on venues for select using (true);
create policy "Public write access" on venues for all using (true) with check (true);

alter table events add column if not exists venue_id bigint references venues (id);
create index if not exists events_venue_id_idx on events (venue_id);

-- 名寄せマッピングからのバックフィル(会場ごとに insert + update のペア)
insert into venues (name) values ('AKIBAカルチャーズ劇場');
update events set venue_id = (select id from venues where name = 'AKIBAカルチャーズ劇場') where location = 'AKIBAカルチャーズ劇場';

insert into venues (name) values ('APEXIA');
update events set venue_id = (select id from venues where name = 'APEXIA') where location = 'APEXIA';

insert into venues (name) values ('DOLL FACTRY');
update events set venue_id = (select id from venues where name = 'DOLL FACTRY') where location = 'DOLL FACTRY';

insert into venues (name) values ('Dreamステージ');
update events set venue_id = (select id from venues where name = 'Dreamステージ') where location = 'Dreamステージ';

insert into venues (name) values ('EBiS303');
update events set venue_id = (select id from venues where name = 'EBiS303') where location = 'EBiS303';

insert into venues (name) values ('GARDEN新木場 FACTORY');
update events set venue_id = (select id from venues where name = 'GARDEN新木場 FACTORY') where location = any(array['GARDEN新木場', 'GARDEN新木場 FACTORY', 'GARDEN新木場FACTORY']);

insert into venues (name) values ('GARRET udagawa');
update events set venue_id = (select id from venues where name = 'GARRET udagawa') where location = 'GARRET udagawa';

insert into venues (name) values ('GOTANDA G+');
update events set venue_id = (select id from venues where name = 'GOTANDA G+') where location = 'GOTANDA G+';

insert into venues (name) values ('GOTANDA G4');
update events set venue_id = (select id from venues where name = 'GOTANDA G4') where location = 'GOTANDA G4';

insert into venues (name) values ('GOTANDA G6');
update events set venue_id = (select id from venues where name = 'GOTANDA G6') where location = 'GOTANDA G6';

insert into venues (name) values ('GOTANDA G6,7');
update events set venue_id = (select id from venues where name = 'GOTANDA G6,7') where location = 'GOTANDA G6,7';

insert into venues (name) values ('GOTANDA G7');
update events set venue_id = (select id from venues where name = 'GOTANDA G7') where location = 'GOTANDA G7';

insert into venues (name) values ('HMV＆BOOKS SHIBUYA 5Fイベントスペース');
update events set venue_id = (select id from venues where name = 'HMV＆BOOKS SHIBUYA 5Fイベントスペース') where location = any(array['HMV&BOOKS SHIBUYA 5F', 'HMV＆BOOKS SHIBUYA', 'HMV＆BOOKS SHIBUYA 5F', 'HMV＆BOOKS SHIBUYA 5Fイベントスペース']);

insert into venues (name) values ('HMV＆BOOKS SHIBUYA 6Fイベントスペース');
update events set venue_id = (select id from venues where name = 'HMV＆BOOKS SHIBUYA 6Fイベントスペース') where location = 'HMV＆BOOKS SHIBUYA 6Fイベントスペース';

insert into venues (name) values ('LA CITTADELLA 中央噴水広場');
update events set venue_id = (select id from venues where name = 'LA CITTADELLA 中央噴水広場') where location = any(array['LA CITTADELLA 中央噴水広場', '川崎 LA CITTADELLA']);

insert into venues (name) values ('LIQUIDROOM');
update events set venue_id = (select id from venues where name = 'LIQUIDROOM') where location = any(array['LIQUID ROOM', 'LIQUIDROOM', '恵比寿LIQUIDROOM']);

insert into venues (name) values ('LIVE STAGE GUILTY');
update events set venue_id = (select id from venues where name = 'LIVE STAGE GUILTY') where location = 'LIVE STAGE GUILTY';

insert into venues (name) values ('MAGNET by SHIBUYA109');
update events set venue_id = (select id from venues where name = 'MAGNET by SHIBUYA109') where location = 'MAGNET by SHIBUYA109';

insert into venues (name) values ('OSAKA MUSE');
update events set venue_id = (select id from venues where name = 'OSAKA MUSE') where location = 'OSAKA MUSE';

insert into venues (name) values ('SHIBUYA CYCLONE');
update events set venue_id = (select id from venues where name = 'SHIBUYA CYCLONE') where location = 'SHIBUYA CYCLONE';

insert into venues (name) values ('SHIBUYA PLEASURE PLEASURE');
update events set venue_id = (select id from venues where name = 'SHIBUYA PLEASURE PLEASURE') where location = 'SHIBUYA PLEASURE PLEASURE';

insert into venues (name) values ('SHIBUYA RING');
update events set venue_id = (select id from venues where name = 'SHIBUYA RING') where location = 'SHIBUYA RING';

insert into venues (name) values ('SHIBUYA VIDENT');
update events set venue_id = (select id from venues where name = 'SHIBUYA VIDENT') where location = any(array['SHIBUYA VIDENT', '渋谷VIDENT']);

insert into venues (name) values ('SKY STAGE');
update events set venue_id = (select id from venues where name = 'SKY STAGE') where location = 'SKY STAGE';

insert into venues (name) values ('Spotify O-EAST');
update events set venue_id = (select id from venues where name = 'Spotify O-EAST') where location = any(array['O-EAST', 'Spotify O-EAST']);

insert into venues (name) values ('Spotify O-WEST');
update events set venue_id = (select id from venues where name = 'Spotify O-WEST') where location = 'Spotify O-WEST';

insert into venues (name) values ('Spotify O-nest');
update events set venue_id = (select id from venues where name = 'Spotify O-nest') where location = 'Spotify O-nest';

insert into venues (name) values ('TFTホール500');
update events set venue_id = (select id from venues where name = 'TFTホール500') where location = 'TFTホール500';

insert into venues (name) values ('TOKYO FM HALL');
update events set venue_id = (select id from venues where name = 'TOKYO FM HALL') where location = any(array['TOKYO FM HALL', 'Tokyo FMホール']);

insert into venues (name) values ('TwinBox AKIHABARA');
update events set venue_id = (select id from venues where name = 'TwinBox AKIHABARA') where location = 'TwinBox AKIHABARA';

insert into venues (name) values ('Veats SHIBUYA');
update events set venue_id = (select id from venues where name = 'Veats SHIBUYA') where location = 'Veats SHIBUYA';

insert into venues (name) values ('WOMB LIVE');
update events set venue_id = (select id from venues where name = 'WOMB LIVE') where location = 'WOMB LIVE';

insert into venues (name) values ('WWWX');
update events set venue_id = (select id from venues where name = 'WWWX') where location = 'WWWX';

insert into venues (name) values ('YOKOHAMA COAST garage+');
update events set venue_id = (select id from venues where name = 'YOKOHAMA COAST garage+') where location = any(array['YOKOHAMA  COAST', 'YOKOHAMA COAST garage+']);

insert into venues (name) values ('Zepp Diver City');
update events set venue_id = (select id from venues where name = 'Zepp Diver City') where location = 'Zepp Diver City';

insert into venues (name) values ('Zepp Nagoya');
update events set venue_id = (select id from venues where name = 'Zepp Nagoya') where location = 'Zepp Nagoya';

insert into venues (name) values ('Zepp Shinjuku');
update events set venue_id = (select id from venues where name = 'Zepp Shinjuku') where location = 'Zepp Shinjuku';

insert into venues (name) values ('duo MUSIC EXCHANGE');
update events set venue_id = (select id from venues where name = 'duo MUSIC EXCHANGE') where location = any(array['duo MUSIC', 'duo MUSIC EXCHANGE']);

insert into venues (name) values ('unravel tokyo');
update events set venue_id = (select id from venues where name = 'unravel tokyo') where location = 'unravel tokyo';

insert into venues (name) values ('☁️KIKU STAGE☁️');
update events set venue_id = (select id from venues where name = '☁️KIKU STAGE☁️') where location = '☁️KIKU STAGE☁️';

insert into venues (name) values ('お台場R地区特設会場 KABUTOMUSHI STAGE');
update events set venue_id = (select id from venues where name = 'お台場R地区特設会場 KABUTOMUSHI STAGE') where location = 'お台場R地区特設会場 KABUTOMUSHI STAGE';

insert into venues (name) values ('お台場野外特設会場');
update events set venue_id = (select id from venues where name = 'お台場野外特設会場') where location = 'お台場野外特設会場';

insert into venues (name) values ('ららぽーとTOKYO-BAY');
update events set venue_id = (select id from venues where name = 'ららぽーとTOKYO-BAY') where location = 'ららぽーとTOKYO-BAY';

insert into venues (name) values ('ららぽーと新三郷 1Fスカイガーデンステージ');
update events set venue_id = (select id from venues where name = 'ららぽーと新三郷 1Fスカイガーデンステージ') where location = any(array['ららぽーと新三郷', 'ららぽーと新三郷 1Fスカイガーデンステージ']);

insert into venues (name) values ('ららぽーと柏の葉');
update events set venue_id = (select id from venues where name = 'ららぽーと柏の葉') where location = 'ららぽーと柏の葉';

insert into venues (name) values ('アキバステラキューブ');
update events set venue_id = (select id from venues where name = 'アキバステラキューブ') where location = 'アキバステラキューブ';

insert into venues (name) values ('イオンモールむさし村山 つむぐ広場特設会場');
update events set venue_id = (select id from venues where name = 'イオンモールむさし村山 つむぐ広場特設会場') where location = 'イオンモールむさし村山 つむぐ広場特設会場';

insert into venues (name) values ('イオンモール幕張新都心 グランドモール1階グランドスクエア');
update events set venue_id = (select id from venues where name = 'イオンモール幕張新都心 グランドモール1階グランドスクエア') where location = any(array['イオンモール幕張新都心', 'イオンモール幕張新都心 グランドモール', 'イオンモール幕張新都心 グランドモール1F グランドスクエア', '千葉・イオンモール幕張新都心 グランドモール 1階グランドスクエア']);

insert into venues (name) values ('エンタバアキバ');
update events set venue_id = (select id from venues where name = 'エンタバアキバ') where location = any(array['エンタバアキバ', 'エンタバアキバ イベントスペース']);

insert into venues (name) values ('シアターマーキュリー新宿');
update events set venue_id = (select id from venues where name = 'シアターマーキュリー新宿') where location = 'ｼｱﾀｰﾏｰｷｭﾘｰ新宿';

insert into venues (name) values ('シティホール五反田');
update events set venue_id = (select id from venues where name = 'シティホール五反田') where location = 'シティホール五反田';

insert into venues (name) values ('スターラウンジ');
update events set venue_id = (select id from venues where name = 'スターラウンジ') where location = 'スターラウンジ';

insert into venues (name) values ('タワーレコード川崎店 イベントスペース');
update events set venue_id = (select id from venues where name = 'タワーレコード川崎店 イベントスペース') where location = any(array['タワーレコード川崎店', 'タワーレコード川崎店 イベントスペース', 'タワーレコード川崎店 店内イベントスペース']);

insert into venues (name) values ('タワーレコード新宿店 9F店内イベントスペース');
update events set venue_id = (select id from venues where name = 'タワーレコード新宿店 9F店内イベントスペース') where location = any(array['タワーレコード新宿店', 'タワーレコード新宿店 9F店内イベントスペース']);

insert into venues (name) values ('タワーレコード池袋店 イベントスペース');
update events set venue_id = (select id from venues where name = 'タワーレコード池袋店 イベントスペース') where location = any(array['タワーレコード池袋店', 'タワーレコード池袋店 イベントスペース']);

insert into venues (name) values ('タワーレコード渋谷店 5階イベントスペース');
update events set venue_id = (select id from venues where name = 'タワーレコード渋谷店 5階イベントスペース') where location = any(array['タワーレコード渋谷店 5F', 'タワーレコード渋谷店 5階', 'タワーレコード渋谷店 5階イベントスペース']);

insert into venues (name) values ('タワーレコード渋谷店 B1F CUTUP STUDIO');
update events set venue_id = (select id from venues where name = 'タワーレコード渋谷店 B1F CUTUP STUDIO') where location = any(array['タワーレコード渋谷 CUTUP', 'タワーレコード渋谷店 Ｂ1F CUTUP', 'タワーレコード渋谷店B1F CUTUP STUDIO']);

insert into venues (name) values ('タワーレコード錦糸町パルコ店');
update events set venue_id = (select id from venues where name = 'タワーレコード錦糸町パルコ店') where location = 'タワーレコード錦糸町パルコ店';

insert into venues (name) values ('チェルシーホテル');
update events set venue_id = (select id from venues where name = 'チェルシーホテル') where location = 'チェルシーホテル';

insert into venues (name) values ('ニッケコルトンプラザ タワーコート');
update events set venue_id = (select id from venues where name = 'ニッケコルトンプラザ タワーコート') where location = 'ニッケコルトンプラザ タワーコート';

insert into venues (name) values ('バトゥール東京');
update events set venue_id = (select id from venues where name = 'バトゥール東京') where location = 'バトゥール東京';

insert into venues (name) values ('ヒューリックホール東京');
update events set venue_id = (select id from venues where name = 'ヒューリックホール東京') where location = 'ヒューリックホール東京';

insert into venues (name) values ('ベルエポック美容専門学校第二校舎、WITH HARAJUKU HALL');
update events set venue_id = (select id from venues where name = 'ベルエポック美容専門学校第二校舎、WITH HARAJUKU HALL') where location = 'ベルエポック美容専門学校第二校舎、WITH HARAJUKU HALL';

insert into venues (name) values ('ベルサール秋葉');
update events set venue_id = (select id from venues where name = 'ベルサール秋葉') where location = 'ベルサール秋葉';

insert into venues (name) values ('ララガーデン春日部1Fステージ');
update events set venue_id = (select id from venues where name = 'ララガーデン春日部1Fステージ') where location = 'ララガーデン春日部1Fステージ';

insert into venues (name) values ('ヴィレッジヴァンガード渋谷本店 B2店内イベントスペース');
update events set venue_id = (select id from venues where name = 'ヴィレッジヴァンガード渋谷本店 B2店内イベントスペース') where location = any(array['ヴィレッジヴァンガード渋谷本店', 'ヴィレッジヴァンガード渋谷本店  B2店内イベントスペース', 'ヴィレッジヴァンガード渋谷本店B2店内イベントスペース']);

insert into venues (name) values ('上野水上音楽堂');
update events set venue_id = (select id from venues where name = '上野水上音楽堂') where location = '上野水上音楽堂';

insert into venues (name) values ('京王プラザホテル');
update events set venue_id = (select id from venues where name = '京王プラザホテル') where location = '京王プラザホテル';

insert into venues (name) values ('北とぴあ さくらホール');
update events set venue_id = (select id from venues where name = '北とぴあ さくらホール') where location = '北とぴあ さくらホール';

insert into venues (name) values ('品川インターシティホール');
update events set venue_id = (select id from venues where name = '品川インターシティホール') where location = '品川インターシティホール';

insert into venues (name) values ('品川グランドホール');
update events set venue_id = (select id from venues where name = '品川グランドホール') where location = '品川グランドホール';

insert into venues (name) values ('大宮アルシェ');
update events set venue_id = (select id from venues where name = '大宮アルシェ') where location = '大宮アルシェ';

insert into venues (name) values ('山中湖交流プラザきらら');
update events set venue_id = (select id from venues where name = '山中湖交流プラザきらら') where location = '山中湖交流プラザきらら';

insert into venues (name) values ('山王ヒルズホール');
update events set venue_id = (select id from venues where name = '山王ヒルズホール') where location = '山王ヒルズホール';

insert into venues (name) values ('川崎CLUB CITTA''');
update events set venue_id = (select id from venues where name = '川崎CLUB CITTA''') where location = '川崎CLUB CITTA''';

insert into venues (name) values ('幕張メッセ vol.2');
update events set venue_id = (select id from venues where name = '幕張メッセ vol.2') where location = '幕張メッセ vol.2';

insert into venues (name) values ('幕張海浜公園Gブロック NATSUステージ');
update events set venue_id = (select id from venues where name = '幕張海浜公園Gブロック NATSUステージ') where location = any(array['幕張海浜公園 NATSUステージ', '幕張海浜公園Gブロック NATSUステージ']);

insert into venues (name) values ('平塚競輪場');
update events set venue_id = (select id from venues where name = '平塚競輪場') where location = '平塚競輪場';

insert into venues (name) values ('恵比寿ガーデンルーム');
update events set venue_id = (select id from venues where name = '恵比寿ガーデンルーム') where location = '恵比寿ガーデンルーム';

insert into venues (name) values ('新宿BLAZE');
update events set venue_id = (select id from venues where name = '新宿BLAZE') where location = '新宿BLAZE';

insert into venues (name) values ('新宿DHNoA');
update events set venue_id = (select id from venues where name = '新宿DHNoA') where location = '新宿DHNoA';

insert into venues (name) values ('新宿FACE');
update events set venue_id = (select id from venues where name = '新宿FACE') where location = '新宿FACE';

insert into venues (name) values ('新宿ReNY');
update events set venue_id = (select id from venues where name = '新宿ReNY') where location = '新宿ReNY';

insert into venues (name) values ('新宿マルイメン');
update events set venue_id = (select id from venues where name = '新宿マルイメン') where location = '新宿マルイメン';

insert into venues (name) values ('新栄シャングリラ');
update events set venue_id = (select id from venues where name = '新栄シャングリラ') where location = '新栄シャングリラ';

insert into venues (name) values ('日本丸メモリアルパーク 屋外メインアリーナ');
update events set venue_id = (select id from venues where name = '日本丸メモリアルパーク 屋外メインアリーナ') where location = any(array['日本丸メモリアルパーク', '日本丸メモリアルパーク 屋外メインアリーナ', '横浜日本丸メモリアルパーク屋外メインアリーナ']);

insert into venues (name) values ('時事通信ホール');
update events set venue_id = (select id from venues where name = '時事通信ホール') where location = '時事通信ホール';

insert into venues (name) values ('有楽町ヒューリックホール');
update events set venue_id = (select id from venues where name = '有楽町ヒューリックホール') where location = '有楽町ヒューリックホール';

insert into venues (name) values ('東京キネマ倶楽部');
update events set venue_id = (select id from venues where name = '東京キネマ倶楽部') where location = any(array['キネマ倶楽部', '東京キネマ倶楽部']);

insert into venues (name) values ('東急歌舞伎町タワー2階新宿カブキhall～歌舞伎横丁「FIRST STAGE」');
update events set venue_id = (select id from venues where name = '東急歌舞伎町タワー2階新宿カブキhall～歌舞伎横丁「FIRST STAGE」') where location = any(array['東急歌舞伎町タワー2階新宿カブキhall～歌舞伎横丁「FIRST STAGE」', '歌舞伎町タワー2階新宿カブキ']);

insert into venues (name) values ('東扇島東公園');
update events set venue_id = (select id from venues where name = '東扇島東公園') where location = '東扇島東公園';

insert into venues (name) values ('横浜みなとみらいブロンテ');
update events set venue_id = (select id from venues where name = '横浜みなとみらいブロンテ') where location = any(array['横浜MMブロンテ', '横浜みなとみらいブロンテ']);

insert into venues (name) values ('横浜アリーナ キウイステージ');
update events set venue_id = (select id from venues where name = '横浜アリーナ キウイステージ') where location = '横浜アリーナ キウイステージ';

insert into venues (name) values ('横浜アリーナ パイナップルステージ');
update events set venue_id = (select id from venues where name = '横浜アリーナ パイナップルステージ') where location = '横浜アリーナ パイナップルステージ';

insert into venues (name) values ('横浜アリーナ ピーチステージ');
update events set venue_id = (select id from venues where name = '横浜アリーナ ピーチステージ') where location = '横浜アリーナ ピーチステージ';

insert into venues (name) values ('横浜ランドマークホール');
update events set venue_id = (select id from venues where name = '横浜ランドマークホール') where location = '横浜ランドマークホール';

insert into venues (name) values ('汐留シオサイト');
update events set venue_id = (select id from venues where name = '汐留シオサイト') where location = any(array['汐留シオサイト', '汐留シオサイト地下歩道', '汐留シオサイト地下通路 特設スペース']);

insert into venues (name) values ('池袋Studio Mixa');
update events set venue_id = (select id from venues where name = '池袋Studio Mixa') where location = '池袋Studio Mixa';

insert into venues (name) values ('池袋harevutai');
update events set venue_id = (select id from venues where name = '池袋harevutai') where location = any(array['harevutai', '池袋harebutai', '池袋harevutai']);

insert into venues (name) values ('池袋西口公園野外劇場グローバルリングシアター');
update events set venue_id = (select id from venues where name = '池袋西口公園野外劇場グローバルリングシアター') where location = any(array['池袋西口公園野外劇場グローバルリング シアター', '池袋西口公園野外劇場グローバルリングシアター']);

insert into venues (name) values ('浅草花劇場');
update events set venue_id = (select id from venues where name = '浅草花劇場') where location = '浅草花劇場';

insert into venues (name) values ('浮島ステージ');
update events set venue_id = (select id from venues where name = '浮島ステージ') where location = any(array['浮島STAGE', '浮島ステージ']);

insert into venues (name) values ('海の森水上競技場 ☁️オニキスステージ☁️');
update events set venue_id = (select id from venues where name = '海の森水上競技場 ☁️オニキスステージ☁️') where location = '海の森水上競技場 ☁️オニキスステージ☁️';

insert into venues (name) values ('海の森水上競技場 ☁️クリスタルステージ☁️');
update events set venue_id = (select id from venues where name = '海の森水上競技場 ☁️クリスタルステージ☁️') where location = '海の森水上競技場 ☁️クリスタルステージ☁️';

insert into venues (name) values ('海の森水上競技場 💎サファイアステージ💎');
update events set venue_id = (select id from venues where name = '海の森水上競技場 💎サファイアステージ💎') where location = '海の森水上競技場 💎サファイアステージ💎';

insert into venues (name) values ('渋谷 WWW');
update events set venue_id = (select id from venues where name = '渋谷 WWW') where location = '渋谷 WWW';

insert into venues (name) values ('渋谷THE GAME');
update events set venue_id = (select id from venues where name = '渋谷THE GAME') where location = '渋谷THE GAME';

insert into venues (name) values ('渋谷ストリームホール');
update events set venue_id = (select id from venues where name = '渋谷ストリームホール') where location = '渋谷ストリームホール';

insert into venues (name) values ('渋谷ヒカリエホール');
update events set venue_id = (select id from venues where name = '渋谷ヒカリエホール') where location = '渋谷ヒカリエホール';

insert into venues (name) values ('白金高輪SELENE b2');
update events set venue_id = (select id from venues where name = '白金高輪SELENE b2') where location = '白金高輪SELENE b2';

insert into venues (name) values ('神田スクエアホール');
update events set venue_id = (select id from venues where name = '神田スクエアホール') where location = '神田スクエアホール';

insert into venues (name) values ('神田明神EDOCCO STUDIO');
update events set venue_id = (select id from venues where name = '神田明神EDOCCO STUDIO') where location = any(array['EDOCCO STUDIO', '神田明神EDOCCO STUDIO']);

insert into venues (name) values ('神田明神ホール');
update events set venue_id = (select id from venues where name = '神田明神ホール') where location = '神田明神ホール';

insert into venues (name) values ('秋葉原ZEST');
update events set venue_id = (select id from venues where name = '秋葉原ZEST') where location = '秋葉原ZEST';

insert into venues (name) values ('稲毛海浜公園プール');
update events set venue_id = (select id from venues where name = '稲毛海浜公園プール') where location = '稲毛海浜公園プール';

insert into venues (name) values ('表参道GROUND');
update events set venue_id = (select id from venues where name = '表参道GROUND') where location = '表参道GROUND';

insert into venues (name) values ('西川口Hearts');
update events set venue_id = (select id from venues where name = '西川口Hearts') where location = '西川口Hearts';

insert into venues (name) values ('赤羽ReNY alpha');
update events set venue_id = (select id from venues where name = '赤羽ReNY alpha') where location = '赤羽ReNY alpha';

insert into venues (name) values ('錦糸町マルイ');
update events set venue_id = (select id from venues where name = '錦糸町マルイ') where location = '錦糸町マルイ';

insert into venues (name) values ('青山RizM');
update events set venue_id = (select id from venues where name = '青山RizM') where location = '青山RizM';

insert into venues (name) values ('飛行船シアター');
update events set venue_id = (select id from venues where name = '飛行船シアター') where location = '飛行船シアター';

-- 検証用: 0件になるはず
-- select count(*) from events where location is not null and venue_id is null;
