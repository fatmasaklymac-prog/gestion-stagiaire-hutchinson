BEGIN;

INSERT INTO activites (stagiaire_id, action, statut, date_action) VALUES
(12, 'Nouveau stagiaire ajouté — Imen Sakly', 'en_cours', '2026-07-21T11:57:40.627961'),
(12, 'Présence pointée — Imen Sakly marqué présent', NULL, '2026-07-21T12:02:52.391027'),
(12, 'Présence modifiée — Imen Sakly marqué absent', NULL, '2026-07-21T12:02:54.408621'),
(12, 'Présence modifiée — Imen Sakly marqué présent', NULL, '2026-07-21T12:02:56.238701'),
(12, 'Présence modifiée — Imen Sakly marqué absent', NULL, '2026-07-21T12:02:58.304451'),
(12, 'Présence modifiée — Imen Sakly marqué présent', NULL, '2026-07-21T12:02:59.432752'),
(12, 'Présence modifiée — Imen Sakly marqué absent', NULL, '2026-07-21T12:03:02.100287'),
(12, 'Présence modifiée — Imen Sakly marqué présent', NULL, '2026-07-21T12:03:07.262235'),
(12, 'Présence pointée — Imen Sakly marqué présent', NULL, '2026-07-29T11:50:41.586294');

INSERT INTO activites (stagiaire_id, action, statut, date_action) VALUES
(17, 'Stagiaire créé à partir d''une candidature acceptée — Ahlem Sakly', 'en_attente', '2026-07-23T10:47:42.002542');

INSERT INTO activites (stagiaire_id, action, statut, date_action) VALUES
(18, 'Stagiaire créé à partir d''une candidature acceptée — mortadhaa khidhr', 'en_attente', '2026-07-28T13:29:39.910674');

INSERT INTO activites (stagiaire_id, action, statut, date_action) VALUES
(19, 'Stagiaire créé — lobna trimech', 'en_attente', '2026-07-29T09:26:26.593695');

INSERT INTO presences (stagiaire_id, date, present) VALUES
(12, '2026-07-21', true),
(12, '2026-07-29', true);

COMMIT;
