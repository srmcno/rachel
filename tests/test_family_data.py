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
            for child in person['ch']:
                self.assertIn(pid, [P[child]['f'], P[child]['m']])
            for spouse in person['sp']:
                self.assertIn(pid, P[spouse]['sp'])

    def test_no_ancestral_cycles(self):
        def visit(pid, path):
            self.assertNotIn(pid, path)
            for parent in (P[pid]['f'], P[pid]['m']):
                if parent:
                    visit(parent, path | {pid})
        for pid in P:
            visit(pid, set())

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

    def test_published_media_exists(self):
        for image in C['hero']:
            self.assertTrue((ROOT / image['s']).is_file(), image['s'])
        for person in P.values():
            for photo in person['ph']:
                for folder in ('p', 't'):
                    self.assertTrue((ROOT / 'img' / folder / (photo['k'] + '.jpg')).is_file())


if __name__ == '__main__':
    unittest.main()
