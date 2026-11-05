// Test double forming logic
const v0 = 'SMALL';
const v1 = 'BIG';
const v2 = 'BIG';
const isDoubleForming = (v1 === v2 && v0 !== v1);
console.log('isDoubleForming:', isDoubleForming);
// In this case, v0 is SMALL. If double forming, next is expected to be SMALL (valB)!
// If valA is BIG and valB is SMALL:
// dragonProbA should be 45 (favoring SMALL/valB)!

