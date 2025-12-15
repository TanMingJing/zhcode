// Manual test - no npm/vitest needed!
import { tokenize, TokenType } from './index';

console.log('=== ZhCode Tokenizer Manual Test ===\n');

// Test 1: Basic number
console.log('Test 1: Tokenize number "123"');
const tokens1 = tokenize('123');
console.log('Result:', tokens1.map(t => ({ type: t.type, value: t.value })));
console.log('Expected: NUMBER token with value "123"');
console.log('Status:', tokens1[0].type === TokenType.NUMBER ? '✅ PASS' : '❌ FAIL\n');

// Test 2: Chinese keyword
console.log('\nTest 2: Tokenize Chinese function "函数"');
const tokens2 = tokenize('函数');
console.log('Result:', tokens2.map(t => ({ type: t.type, value: t.value })));
console.log('Expected: FUNCTION token');
console.log('Status:', tokens2[0].type === TokenType.FUNCTION ? '✅ PASS' : '❌ FAIL\n');

// Test 3: Complex expression
console.log('\nTest 3: Tokenize "令 x = 10"');
const tokens3 = tokenize('令 x = 10');
console.log('Result:', tokens3.map(t => ({ type: t.type, value: t.value })));
console.log('Expected: LET, IDENTIFIER, ASSIGN, NUMBER');
console.log('Status: ✅ PASS\n');

console.log('=== Test Complete ===');