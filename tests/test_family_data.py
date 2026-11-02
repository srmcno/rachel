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

    def test_unverified_portraits_are_not_attributed_to_people(self):
        disputed = {'7844d1f4', 'f48f4ebd', '505657d2'}
        for person in P.values():
            self.assertTrue(disputed.isdisjoint(photo['k'] for photo in person['ph']))
        for story in C['stories']:
            for photo in story.get('imgs', []):
                self.assertNotIn(Path(photo['s']).stem, disputed)

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
                for folder in ('p', 't'):
                    self.assertTrue((ROOT / 'img' / folder / (photo['k'] + '.jpg')).is_file())


if __name__ == '__main__':
    unittest.main()
