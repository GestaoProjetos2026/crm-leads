import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'postgres-svc.infra-banco.svc.cluster.local',
  port: parseInt('5432', 10),
  database: 'infra_banco',
  username: 'user_crm_leads',
  password: 'SenhaCrm123!',
  schema: 'crm_leads',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/**/*.subscriber.ts'], 
});

AppDataSource.initialize().then(async () => {}).catch(() => {})

const originalInitialize = AppDataSource.initialize.bind(AppDataSource);
AppDataSource.initialize = async () => {
  const ds = await originalInitialize();
  await ds.query(`
insert into "crm_leads"."leads" (tenant_id, campaign_id, first_name, last_name, email, source, is_inactive, created_at, updated_at) values (1, null, 'Romola', 'Navan', 'rnavan0@wikia.com', 'Man on the Flying Trapeze', false, '2025-07-23 01:54:50', '2025-04-10 19:08:09'),
(1, null, 'Maison', 'McMennum', 'mmcmennum1@issuu.com', 'Landet som icke är', true, '2026-02-01 06:38:26', '2025-04-17 18:30:03'),
(1, null, 'Mabel', 'Ardling', 'mardling2@alibaba.com', 'Extraordinary Stories (Historias extraordinarias)', false, '2025-02-12 22:25:35', '2025-06-11 23:59:21'),
(1, null, 'Pamela', 'Cranmere', 'pcranmere3@unicef.org', 'Vampire in Brooklyn', true, '2025-05-11 03:48:45', '2024-10-15 19:33:08'),
(1, null, 'Mada', 'Furse', 'mfurse4@google.es', 'Piranhaconda', false, '2025-07-19 02:17:17', '2024-04-26 04:30:39'),
(1, null, 'Alaric', 'Normand', 'anormand5@biblegateway.com', 'Sword of Gideon', false, '2025-09-25 01:27:37', '2026-02-07 08:16:45'),
(1, null, 'Erin', 'Hammill', 'ehammill6@china.com.cn', 'Panda! Go Panda! (Panda kopanda)', false, '2025-09-13 02:36:58', '2025-11-22 16:07:48'),
(1, null, 'Iggie', 'Damrell', 'idamrell7@icio.us', 'Batman: Mystery of the Batwoman', true, '2025-08-17 17:37:45', '2026-04-05 12:20:24'),
(1, null, 'Orson', 'Tinsley', 'otinsley8@forbes.com', 'Trail Beyond, The', false, '2024-04-28 09:23:16', '2026-05-12 15:48:13'),
(1, null, 'Maudie', 'McDougle', 'mmcdougle9@bandcamp.com', 'Forgiving Dr. Mengele', true, '2026-01-10 03:08:50', '2025-10-10 21:38:07'),
(1, null, 'Lila', 'Rawlingson', 'lrawlingsona@reuters.com', 'Goodbye Uncle Tom', true, '2024-07-10 04:34:19', '2025-03-07 14:12:45'),
(1, null, 'Aliza', 'O''Caherny', 'aocahernyb@sakura.ne.jp', 'Garfield Gets Real', true, '2025-11-09 03:50:44', '2025-07-22 03:49:29'),
(1, null, 'Lelia', 'Minucci', 'lminuccic@linkedin.com', 'Last Stop 174 (Última Parada 174) ', false, '2025-05-04 05:22:27', '2024-09-18 02:53:28'),
(1, null, 'Amaleta', 'Janas', 'ajanasd@istockphoto.com', 'Labyrinth of Passion (Laberinto de Pasiones)', false, '2025-05-23 09:38:59', '2026-02-04 10:21:16'),
(1, null, 'Alexandre', 'O''Dennehy', 'aodennehye@spiegel.de', 'Every Man for Himself (Slow Motion) (Sauve qui peut (la vie))', true, '2026-02-28 00:04:54', '2025-01-29 04:34:00'),
(1, null, 'Nadia', 'Khan', 'nkhanf@ted.com', 'Brother (Hermano)', true, '2026-02-20 10:27:15', '2024-10-21 02:26:56'),
(1, null, 'Rusty', 'Tatum', 'rtatumg@clickbank.net', 'Fresh Horses', false, '2026-05-21 21:15:49', '2025-02-06 21:45:32'),
(1, null, 'Even', 'Greensted', 'egreenstedh@123-reg.co.uk', 'Solas', true, '2025-01-11 03:10:35', '2025-03-03 09:53:40'),
(1, null, 'Jilleen', 'Peeke', 'jpeekei@dell.com', 'Appleseed Alpha', true, '2025-01-13 12:50:13', '2025-01-22 10:15:49'),
(1, null, 'Zelig', 'Ronisch', 'zronischj@spiegel.de', 'Day of the Dead', false, '2024-06-10 06:04:30', '2024-02-02 21:28:14'),
(1, null, 'Graig', 'Tomashov', 'gtomashovk@deliciousdays.com', 'Maze, The', false, '2024-07-03 23:26:11', '2024-06-20 19:35:54'),
(1, null, 'Annabella', 'Bolf', 'abolfl@earthlink.net', 'Lucky One, The', false, '2026-05-22 19:24:33', '2024-01-08 01:30:43'),
(1, null, 'Hedda', 'Sabathe', 'hsabathem@forbes.com', 'Loverboy', true, '2026-05-18 15:07:56', '2024-01-11 07:49:52'),
(1, null, 'Cesare', 'Edgson', 'cedgsonn@ameblo.jp', 'Bionicle 2: Legends of Metru Nui', false, '2024-12-24 10:12:26', '2025-03-03 22:53:10'),
(1, null, 'Kikelia', 'Guitton', 'kguittono@answers.com', 'Up the Down Staircase', false, '2024-12-23 03:02:48', '2026-03-19 17:36:13'),
(1, null, 'Wallache', 'Denzilow', 'wdenzilowp@furl.net', 'Sherlock Holmes Faces Death', true, '2026-04-03 15:27:52', '2025-04-10 07:25:22'),
(1, null, 'Merline', 'Gierhard', 'mgierhardq@quantcast.com', 'Enough Said', true, '2025-01-09 01:44:24', '2025-03-30 07:06:14'),
(1, null, 'Jorry', 'Joysey', 'jjoyseyr@hud.gov', 'Lady in the Lake', true, '2025-10-21 05:43:18', '2025-07-31 11:37:28'),
(1, null, 'Rosetta', 'Moneypenny', 'rmoneypennys@gizmodo.com', 'Road to Bali', true, '2025-03-10 07:59:39', '2025-04-28 00:00:18'),
(1, null, 'Benita', 'Clyne', 'bclynet@cdc.gov', 'Whiteout', false, '2024-04-12 18:54:50', '2025-09-21 11:47:20'),
(1, null, 'Marysa', 'Queyeiro', 'mqueyeirou@biglobe.ne.jp', 'Antitrust', true, '2025-08-21 03:28:23', '2025-09-29 11:04:07'),
(1, null, 'Kahlil', 'Pordall', 'kpordallv@buzzfeed.com', 'Nude Bomb, The', true, '2024-10-17 17:47:21', '2024-02-16 10:23:36'),
(1, null, 'Berny', 'Graveney', 'bgraveneyw@photobucket.com', 'Best Man, The', true, '2025-09-20 16:24:05', '2025-12-18 14:04:14'),
(1, null, 'Mace', 'Bouller', 'mboullerx@dmoz.org', 'Phantom Lady', true, '2024-08-21 20:28:58', '2025-11-23 11:44:57'),
(1, null, 'Simone', 'Meah', 'smeahy@latimes.com', 'Firm, The', false, '2025-07-18 20:24:22', '2024-01-16 08:54:40'),
(1, null, 'Jareb', 'Celier', 'jcelierz@photobucket.com', 'Unknown Woman, The (Tuntematon emäntä)', false, '2026-03-22 18:45:03', '2025-07-21 04:06:48'),
(1, null, 'Emmalyn', 'Gentil', 'egentil10@jiathis.com', 'The Feathered Serpent', true, '2026-02-11 17:00:36', '2024-09-13 00:42:08'),
(1, null, 'Cassie', 'Brood', 'cbrood11@home.pl', 'Rush', false, '2025-02-08 15:11:20', '2025-07-12 00:11:32'),
(1, null, 'Garrik', 'Fallows', 'gfallows12@shinystat.com', 'My Love Has Been Burning (Waga koi wa moenu)', false, '2025-07-15 11:13:59', '2026-02-19 08:14:32'),
(1, null, 'Goran', 'Gaze', 'ggaze13@gnu.org', 'My Way to Olympia (Mein Weg nach Olympia)', true, '2026-04-06 14:23:46', '2024-11-20 09:21:26'),
(1, null, 'Koenraad', 'Woltering', 'kwoltering14@pagesperso-orange.fr', 'Big Buck Bunny', false, '2025-04-10 00:59:36', '2025-11-02 08:42:57'),
(1, null, 'Marylinda', 'Braybrooks', 'mbraybrooks15@wp.com', 'Killer of Sheep', true, '2024-08-15 13:05:45', '2026-04-14 13:51:33'),
(1, null, 'Gaultiero', 'Font', 'gfont16@homestead.com', 'Tyler Perry''s Why Did I Get Married Too?', false, '2025-12-11 05:06:13', '2024-08-09 15:56:25'),
(1, null, 'Ethelind', 'Siemens', 'esiemens17@webnode.com', 'Beloved/Friend (a.k.a. Amigo/Amado) (Amic/Amat)', false, '2024-05-03 16:21:35', '2025-11-19 12:10:42'),
(1, null, 'Isador', 'Rowthorn', 'irowthorn18@free.fr', 'Still Walking (Aruitemo aruitemo)', true, '2025-09-24 08:37:30', '2025-12-08 07:36:21'),
(1, null, 'Michelle', 'Hustings', 'mhustings19@mapy.cz', 'Lizzie McGuire Movie, The', true, '2025-12-14 20:39:00', '2024-03-29 09:59:06'),
(1, null, 'Aaren', 'Isabell', 'aisabell1a@ning.com', 'Desert Blue', true, '2025-11-30 02:26:09', '2025-11-06 16:18:05'),
(1, null, 'Maurie', 'Scullin', 'mscullin1b@nba.com', 'Material Girls', true, '2024-04-30 13:17:42', '2025-05-13 22:06:29'),
(1, null, 'Marc', 'Shall', 'mshall1c@yolasite.com', 'Aakrosh', true, '2025-11-25 09:10:20', '2025-09-22 22:02:19'),
(1, null, 'Kin', 'Smye', 'ksmye1d@wordpress.org', 'Fingers', true, '2026-03-26 21:14:49', '2025-04-17 19:12:59'),
(1, null, 'Caroline', 'Konerding', 'ckonerding1e@cafepress.com', 'Babylon 5: The Lost Tales - Voices in the Dark', true, '2026-03-05 15:55:17', '2024-08-13 20:51:08'),
(1, null, 'Tandie', 'Dougliss', 'tdougliss1f@ihg.com', 'Stories We Tell', false, '2025-04-04 11:23:09', '2026-04-02 08:57:32'),
(1, null, 'Roslyn', 'Allot', 'rallot1g@flavors.me', 'Who''s Your Daddy?', true, '2025-09-23 22:50:18', '2026-04-23 17:50:19'),
(1, null, 'Tan', 'Baxstare', 'tbaxstare1h@latimes.com', 'Sexual Chronicles of a French Family (Chroniques sexuelles d''une famille d''aujourd''hui)', false, '2024-12-25 23:04:14', '2025-07-17 10:45:51'),
(1, null, 'Jdavie', 'Cubbinelli', 'jcubbinelli1i@theglobeandmail.com', 'True Romance', false, '2024-04-22 10:37:16', '2024-10-27 15:14:38'),
(1, null, 'Norrie', 'Kinsella', 'nkinsella1j@sohu.com', 'Heat', false, '2025-09-26 06:43:11', '2025-01-07 02:41:32'),
(1, null, 'Karleen', 'Earwaker', 'kearwaker1k@furl.net', 'Heaven & Earth', false, '2025-09-22 12:02:30', '2024-01-16 10:32:29'),
(1, null, 'Tommie', 'Gutcher', 'tgutcher1l@ted.com', 'Embodiment of Evil (Encarnação do Demônio)', true, '2024-12-28 19:36:29', '2025-09-28 16:39:17');
    `);
  return ds;
};

export default AppDataSource;