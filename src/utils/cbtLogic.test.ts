import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  formatTimeShort,
  validateToken,
  normalizeAnswer,
  isAnswerCorrect,
  calculateExamScore,
  getQuestionStatus,
  parseMatchingAnswer,
  serializeMatchingAnswer,
  recordViolation,
  getIntegrityRating,
} from './cbtLogic';

test('formatTime formats seconds into HH:MM:SS', () => {
  assert.equal(formatTime(0), '00:00:00');
  assert.equal(formatTime(65), '00:01:05');
  assert.equal(formatTime(3665), '01:01:05');
  assert.equal(formatTime(-10), '00:00:00');
});

test('formatTimeShort formats seconds into MM:SS', () => {
  assert.equal(formatTimeShort(0), '00:00');
  assert.equal(formatTimeShort(35), '00:35'); // Exactly matches user's screenshot "Selesai 00:35"
  assert.equal(formatTimeShort(60), '01:00');
  assert.equal(formatTimeShort(125), '02:05');
  assert.equal(formatTimeShort(300), '05:00');
});

test('validateToken checks case-insensitive token', () => {
  assert.equal(validateToken('anbk26', 'ANBK26'), true);
  assert.equal(validateToken('  ANBK26  ', 'anbk26'), true);
  assert.equal(validateToken('WRONG', 'ANBK26'), false);
  assert.equal(validateToken('', 'ANBK26'), false);
});

test('normalizeAnswer properly normalizes various question types', () => {
  // PG
  assert.equal(normalizeAnswer('PG', ' b '), 'B');

  // PG_KOMPLEKS (sorted set)
  assert.equal(normalizeAnswer('PG_KOMPLEKS', 'C,A,D'), 'A,C,D');
  assert.equal(normalizeAnswer('PG_KOMPLEKS', 'B, A'), 'A,B');

  // MENJODOHKAN (sorted by left index)
  assert.equal(normalizeAnswer('MENJODOHKAN', '1-2,0-1,2-0'), '0-1,1-2,2-0');

  // ISIAN (lowercased and normalized whitespace)
  assert.equal(normalizeAnswer('ISIAN', '  Pusat Asesmen   Pendidikan '), 'pusat asesmen pendidikan');
});

test('isAnswerCorrect handles exact matches and order-independent complex options', () => {
  // PG
  assert.equal(isAnswerCorrect({ tipe: 'PG', kunciJawaban: 'B' }, 'B'), true);
  assert.equal(isAnswerCorrect({ tipe: 'PG', kunciJawaban: 'B' }, 'A'), false);

  // PG Kompleks
  assert.equal(isAnswerCorrect({ tipe: 'PG_KOMPLEKS', kunciJawaban: 'A,C' }, 'C,A'), true);
  assert.equal(isAnswerCorrect({ tipe: 'PG_KOMPLEKS', kunciJawaban: 'A,C' }, 'A,B'), false);

  // Menjodohkan
  assert.equal(isAnswerCorrect({ tipe: 'MENJODOHKAN', kunciJawaban: '0-1,1-0' }, '1-0,0-1'), true);
  assert.equal(isAnswerCorrect({ tipe: 'MENJODOHKAN', kunciJawaban: '0-1,1-0' }, '0-0,1-1'), false);
});

test('calculateExamScore computes overall score and subtest breakdown', () => {
  const questions = [
    { id: 'q1', tipe: 'PG' as const, kunciJawaban: 'A', subtest: 'Literasi' },
    { id: 'q2', tipe: 'PG_KOMPLEKS' as const, kunciJawaban: 'A,B', subtest: 'Literasi' },
    { id: 'q3', tipe: 'MENJODOHKAN' as const, kunciJawaban: '0-0,1-1', subtest: 'Numerasi' },
    { id: 'q4', tipe: 'PG' as const, kunciJawaban: 'C', subtest: 'Numerasi' },
  ];

  const answers = {
    q1: 'A', // correct
    q2: 'B,A', // correct (reordered)
    q3: '0-0,1-1', // correct
    q4: 'D', // wrong
  };

  const result = calculateExamScore(questions, answers);
  assert.equal(result.totalQuestions, 4);
  assert.equal(result.correctCount, 3);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unansweredCount, 0);
  assert.equal(result.finalScore, 75); // 3 out of 4 = 75%
  assert.equal(result.perSubtest['Literasi'].score, 100);
  assert.equal(result.perSubtest['Numerasi'].score, 50);
});

test('getQuestionStatus distinguishes unanswered, answered, and doubt', () => {
  assert.equal(getQuestionStatus('q1', {}, []), 'unanswered');
  assert.equal(getQuestionStatus('q1', { q1: 'A' }, []), 'answered');
  assert.equal(getQuestionStatus('q1', { q1: 'A' }, ['q1']), 'doubt');
  assert.equal(getQuestionStatus('q1', {}, ['q1']), 'doubt');
});

test('parseMatchingAnswer and serializeMatchingAnswer roundtrip correctly', () => {
  const raw = '0-2,1-0,2-1';
  const parsed = parseMatchingAnswer(raw);
  assert.deepEqual(parsed, { '0': '2', '1': '0', '2': '1' });
  const serialized = serializeMatchingAnswer(parsed);
  assert.equal(serialized, raw);
});

test('recordViolation and getIntegrityRating handle anti-cheat violations properly', () => {
  let logs: any[] = [];
  logs = recordViolation(logs, 'TAB_SWITCH', 'Membuka aplikasi lain');
  assert.equal(logs.length, 1);
  assert.equal(logs[0].tipe, 'TAB_SWITCH');
  assert.equal(logs[0].pesan, 'Membuka aplikasi lain');

  const cleanRating = getIntegrityRating(0);
  assert.equal(cleanRating.isDisqualified, false);
  assert.match(cleanRating.label, /Jujur/);

  const warnedRating = getIntegrityRating(2);
  assert.equal(warnedRating.isDisqualified, false);
  assert.match(warnedRating.label, /Peringatan/);

  const disqRating = getIntegrityRating(4);
  assert.equal(disqRating.isDisqualified, true);
  assert.match(disqRating.label, /Perlu Ditinjau/);
});
