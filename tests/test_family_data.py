"""Check published family relationships, citations, privacy and local media."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
T = json.loads((ROOT / 'tree.json').read_text())
C = json.loads((ROOT / 'content.json').read_text())
P = T['people']


class FamilyDataTests(unittest.TestCase):
    def test_relationships_resolve_and_are_reciprocal(self):
        self.assertIn(T['root'], P)
        for pid, person in P.items():
            for key in ('f', 'm'):
                parent = person.get(key)
                if parent:
                    self.assertIn(parent, P, (pid, key))
                    self.assertIn(pid, P[parent]['ch'], (pid, parent))
            for link in person.get('otherParents', []):
                self.assertIn(link['id'], P)
                self.assertIn(link['kind'], ('birth', 'adoptive'))
                self.assertIn(pid, P[link['id']]['ch'])
            for child in person['ch']:
                self.assertIn(pid, [P[child]['f'], P[child]['m']] + [link['id'] for link in P[child].get('otherParents', [])])
            for spouse in person['sp']:
                self.assertIn(pid, P[spouse]['sp'])

    def test_no_ancestral_cycles(self):
        def visit(pid, path):
            self.assertNotIn(pid, path)
            for parent in [P[pid]['f'], P[pid]['m']] + [link['id'] for link in P[pid].get('otherParents', [])]:
                if parent:
                    visit(parent, path | {pid})
        for pid in P:
            visit(pid, set())

    def test_unproven_johnson_ancestors_are_not_parent_links(self):
        joel = P['I392640985468']
        self.assertEqual(joel['f'], 'X_joel_george_w_johnson')
        self.assertEqual(joel['m'], 'X_joel_m_rebecca_johnson')
        for parent in (P[joel['f']], P[joel['m']]):
            self.assertEqual(parent['ev'], 'probable')
            self.assertIsNone(parent['f'])
            self.assertIsNone(parent['m'])
        virginia_william = P['I392657396441']
        self.assertIsNone(virginia_william['f'])
        self.assertIsNone(virginia_william['m'])
        self.assertIsNone(virginia_william['gen'])
        self.assertIn('1721', virginia_william['note'])

    def test_diane_birth_and_adoptive_families_remain_distinct(self):
        diane = P['I392640977611']
        self.assertEqual(diane['parentKinds'], {'f': 'adoptive', 'm': 'adoptive'})
        self.assertEqual(diane['f'], 'I392640978802')
        self.assertEqual(diane['m'], 'I392640978803')
        self.assertEqual(diane['otherParents'], [{'id': 'I392641098709', 'kind': 'birth'}])
        biography = next(s for s in C['stories'] if s['id'] == 'diane-rivers')
        self.assertIn('adoptive parents', biography['body'][0])
        self.assertIn('birth father is unknown', ' '.join(biography['body']))
        self.assertNotIn('born in St. Paul on 10 August 1939 to Edward', ' '.join(biography['body']))
        self.assertNotIn('met her birth mother', diane['note'].lower())
        self.assertIn('who had already died', diane['note'].lower())
        self.assertIn('met twin half-sisters', diane['note'].lower())

    def test_two_kocak_mothers_are_not_conflated(self):
        evelyn = P['I392641098709']
        stephen = P['X_stephen_joseph_kocak']
        self.assertEqual(evelyn['m'], 'X_mary_stinar')
        self.assertEqual(stephen['m'], 'X_mary_adeline_pavelko')
        self.assertEqual(evelyn['f'], stephen['f'])
        for person_id in ('X_andrew_kocak', 'X_jan_stinar', 'X_anna_breznay'):
            self.assertIsNone(P[person_id]['f'])
            self.assertIsNone(P[person_id]['m'])
        for person_id in ('X_elizabeth_kocak_lev', 'X_stephen_joseph_kocak', 'X_john_henry_garms'):
            self.assertFalse(P[person_id]['lv'])
            self.assertTrue(P[person_id]['source_urls'])

    def test_kocak_official_indexes_preserve_probable_identifications(self):
        john = P['X_john_andrew_kocak']
        self.assertEqual(john['b'], '5 May 1927')
        self.assertEqual(john['d'], '10 Apr 1984')
        self.assertEqual(john['ev'], 'probable')
        self.assertEqual(john['m'], 'X_mary_stinar')
        self.assertFalse(john['lv'])
        self.assertEqual(P['X_mary_stinar']['d'], '2 Feb 1930')
        self.assertIn('parents are attached as probable', P['X_mary_stinar']['note'])
        for person_id in ('I392641098709', 'X_elizabeth_kocak_lev', 'X_john_andrew_kocak'):
            official = [u for u in P[person_id]['source_urls'] if 'www.mnhs.org/search/people/record?' in u]
            self.assertTrue(official, person_id)
            for url in official:
                self.assertIn('&recordType=', url)

    def test_stinar_extension_is_sourced_and_stops_at_named_parents(self):
        mary = P['X_mary_stinar']
        self.assertEqual((mary['f'], mary['m']), ('X_jan_stinar', 'X_anna_breznay'))
        self.assertEqual(mary['ev'], 'probable')
        self.assertIn('https://www.familysearch.org/ark:/61903/1:1:CBZF-953Z', mary['source_urls'])
        self.assertIn('https://moms.mn.gov/Search', mary['source_urls'])
        for pid in (mary['f'], mary['m']):
            self.assertEqual(P[pid]['ev'], 'probable')
            self.assertIsNone(P[pid]['f'])
            self.assertIsNone(P[pid]['m'])
        story = next(s for s in C['stories'] if s['id'] == 'stinar-family-minneota')
        self.assertIn('September 1892', ' '.join(story['body']))
        self.assertIn('original death certificate is unexamined', ' '.join(story['body']))
        self.assertEqual(len(story['imgs']), 5)
        expected_hashes = {
            'img/docs/stinar_family_1900_federal_original.jpg': 'ea6ba9420e627e17239ba3c4ed71c157ed0816d367e5a10281e04ec2a8b77642',
            'img/docs/stinar_family_1905_state_original.jpg': '773b568aceb020d063a77e0baf6a818d3cb1c245e7445a7623d75a8ea9978bc4',
            'img/docs/stinar_family_1910_federal_original.jpg': '12f920878b880ce9f51da242b25f4f585193676a1482206fec0160c04ce201d2',
            'img/docs/stinar_family_1930_hunter_original.jpg': '6a275d5e092aa5d760a9076426713106f46c40cd4d71d3bb3008eda4301ca64e',
            'img/docs/stinar_anna_1940_lakefield_original.jpg': '8f37c636b63557a3ff9d7d000739a9fb8cb6e8e16f8525a9baa63eeb521919dc',
        }
        import hashlib
        for image in story['imgs']:
            self.assertEqual(hashlib.sha256((ROOT / image['s']).read_bytes()).hexdigest(), expected_hashes[image['s']])
            self.assertEqual(image['kind'], 'record')
            self.assertTrue(image['source'].startswith('https://'))

    def test_unverified_portraits_are_not_attributed_to_people(self):
        disputed = {'7844d1f4', 'f48f4ebd', '505657d2'}
        for person in P.values():
            self.assertTrue(disputed.isdisjoint(photo.get('k', Path(photo.get('s', '')).stem) for photo in person['ph']))
        for story in C['stories']:
            for photo in story.get('imgs', []):
                self.assertNotIn(Path(photo['s']).stem, disputed)

    def test_kocak_draft_originals_and_date_uncertainty_are_preserved(self):
        import hashlib
        story = next(s for s in C['stories'] if s['id'] == 'andrew-kocak-minneota')
        originals = {
            'img/docs/andrew_kocak_1917_draft_original.jpg': 'b14d5396384cf78f9425f99b213705a2bef56bd219472b7874de764ac024930c',
            'img/docs/andrew_kocak_1942_draft_original.jpg': 'fd0edd238756dca9c2973d9550d03e1a662e7cc838663f1d6e5fb8ae5246330e',
        }
        self.assertEqual({image['s'] for image in story['imgs']}, set(originals))
        for image in story['imgs']:
            self.assertEqual(hashlib.sha256((ROOT / image['s']).read_bytes()).hexdigest(), originals[image['s']])
            self.assertEqual(image['kind'], 'record')
        text = ' '.join(story['body'])
        self.assertIn('24 October 1895', text)
        self.assertIn('24 September 1895', text)
        self.assertFalse(P['X_andrew_kocak']['b'])

    def test_living_profiles_keep_private_fields_empty(self):
        for pid, person in P.items():
            if person['lv']:
                for field in ('b', 'bp', 'd', 'dp', 'ph'):
                    self.assertFalse(person.get(field), (pid, field))

    def test_stories_have_sources_valid_people_and_unique_ids(self):
        ids = [s['id'] for s in C['stories']]
        self.assertEqual(len(ids), len(set(ids)))
        for story in C['stories']:
            self.assertTrue(story['src'], story['id'])
            self.assertGreaterEqual(len(story['body']), 3)
            self.assertIn(story['ev'], ('proven', 'probable', 'lead'))
            for pid in story['people']:
                self.assertIn(pid, P, story['id'])
            for image in story.get('imgs', []):
                self.assertTrue((ROOT / image['s']).is_file(), image['s'])
        for event in C['timeline']:
            self.assertIn(event['story'], ids)

    def test_restorations_preserve_existing_originals(self):
        for original, variant in C.get('restorations', {}).items():
            self.assertNotEqual(original, variant['s'])
            self.assertTrue((ROOT / original).is_file(), original)
            self.assertTrue((ROOT / variant['s']).is_file(), variant['s'])
            self.assertEqual(variant['method'], 'AI restoration')
            if variant.get('colorized'):
                self.assertTrue((ROOT / variant['colorized']).is_file())
        for image in C.get('archivePhotos', []):
            self.assertTrue((ROOT / image['s']).is_file())
            self.assertTrue(image['source'].startswith('https://'))
            self.assertTrue(image['credit'])
            self.assertTrue(image['rights'])

    def test_published_media_exists(self):
        for image in C['hero']:
            self.assertTrue((ROOT / image['s']).is_file(), image['s'])
        for person in P.values():
            for photo in person['ph']:
                paths = [photo['s'], photo.get('t', photo['s'])] if photo.get('s') else [f"img/{folder}/{photo['k']}.jpg" for folder in ('p', 't')]
                for path in paths:
                    self.assertTrue((ROOT / path).is_file(), path)


if __name__ == '__main__':
    unittest.main()
