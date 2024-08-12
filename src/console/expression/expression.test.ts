import { parser, ListOfNumbers, BitwiseOperation, Operand, Operator } from "./expression";
import { random } from "../core/utils";
import { INT32_MAX_VALUE } from "../core/const";
import { expect, describe, it } from "bun:test";

describe("expression parser", () => {
  it("parses list of number expression", () => {
    var result = parser.parse("1 2 3");
    expect(result).toBeInstanceOf(ListOfNumbers);
  });

  it("doesn't list of numbers in case of bad numbers", () => {
    expect(parser.parse("1 2 z")).toBeNull();
    expect(parser.parse("")).toBeNull();
  });

  it("pares different operations expressions", () => {
    expect(parser.parse("~1")).toBeInstanceOf(BitwiseOperation);
    expect(parser.parse("1^2")).toBeInstanceOf(BitwiseOperation);
    expect(parser.parse("1|2")).toBeInstanceOf(BitwiseOperation);
  });

  it("parses big binary bitwise expression", () => {
    const input = "0b00010010001101000101011001111000 0b10101010101010101010101000000000";
    const actual = parser.parse(input);
    expect(actual).toBeInstanceOf(ListOfNumbers);

    const expr = actual as ListOfNumbers;
    expect(expr.children[0].getUnderlyingOperand().value.toString()).toBe("305419896");
    expect(expr.children[1].getUnderlyingOperand().value.toString()).toBe("2863311360");
  });

  it("pares multiple operand expression", () => {
    const result = parser.parse("1^2") as BitwiseOperation;
    expect(result.children.length).toBe(2);

    const first = result.children[0];
    const second = result.children[1];

    expect(first).toBeInstanceOf(Operand);

    expect((first as Operand).value.toString()).toBe("1");

    expect(second).toBeInstanceOf(Operator);
    var secondOp = second as Operator;
    expect(secondOp.operator).toBe("^");

    expect(secondOp.operand).toBeInstanceOf(Operand);
    var childOp = secondOp.operand as Operand;
    expect(childOp.value.toString()).toBe("2");
  });

  it("bug", () => {
    var result = parser.parse("1|~2") as BitwiseOperation;
    expect(result.children.length).toBe(2);
  });

  it("bug2", () => {
    const result = parser.parse("0b0000000000000000001000010001011110000010100000001 & (0b0000000000000000001000010001011110000010100000001 >> 7)");
    expect(result).toBeNull();
  });
});

describe("comparison with nodejs engine", () => {
  it("set 32-bit", () => {
    const inputs = ["1485578196>>14", "921979543<<31", "1123|324", "213&9531", "120^442161", "1<<7", "2>>>8", "2<<7"];

    inputs.forEach((i) => testBinary(i, i));
  });

  it("random: two inbary strings 64-bit", () => {
    const signs = ["|", "&", "^", "<<", ">>", ">>>"];

    for (var i = 0; i < 1000; i++) {
      const sign = signs[random(0, signs.length - 1)];
      const isShift = sign.length > 1;
      const op1 = random(-INT32_MAX_VALUE, INT32_MAX_VALUE);
      const op2 = isShift ? random(0, 31) : random(-INT32_MAX_VALUE, INT32_MAX_VALUE);

      const input = op1.toString() + sign + op2.toString();

      testBinary(input, input);
    }
  });

  it("random: 64 and 32-bit", () => {
    for (var i = 0; i < 1000; i++) {
      const num = random(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      const actualInput = "~" + num.toString();
      const expectedInput = num > INT32_MAX_VALUE ? `~BigInt("${num}")` : actualInput;
      const expected = eval(expectedInput).toString();

      let actual = "";

      try {
        const expr = parser.parse(actualInput) as BitwiseOperation;
        const bo = expr.children[0] as Operator;
        const res = bo.evaluate();
        actual = res.value.toString();

        if (actual != expected) {
          const uop = bo.getUnderlyingOperand();
          console.log(`Expected:${expectedInput}\nActual:${actualInput}\n${uop.value} ${uop.value.maxBitSize}\n${res.value} ${typeof res.value} ${res.value.maxBitSize}`);
        }
      } catch (err) {
        console.log(`Error:\nExpected:${expectedInput}\nActual:${actualInput}\n${typeof actualInput}`);

        throw err;
      }

      expect(actual).toBe(expected);
    }
  });

  it("random: two inbary strings 64-bit", () => {
    const signs = ["|", "&", "^"];

    for (var i = 0; i < 1000; i++) {
      const sign = signs[random(0, signs.length - 1)];
      const isShift = sign.length > 1;
      const op1 = random(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      const op2 = isShift ? random(0, 63) : Number.MAX_SAFE_INTEGER;

      const actualInput = `${op1}l${sign}${op2}l`;
      const expectedInput = `BigInt("${op1}")${sign}BigInt("${op2}")`;

      testBinary(expectedInput, actualInput);
    }
  });

  function testBinary(expectedInput: string, actualInput: string) {
    const expected = eval(expectedInput).toString();

    let actual = "";

    try {
      var expr = parser.parse(actualInput) as BitwiseOperation;

      var op1 = expr.children[0] as Operand;
      var op2 = expr.children[1] as Operator;

      actual = op2.evaluate(op1).value.toString();
      const equals = actual === expected;

      if (!equals) {
        console.log(`Expected:${expectedInput}\n$Actual:${actualInput}\nop1:${typeof op1.value}\nop2:${typeof op2.getUnderlyingOperand().value}`);
      }
    } catch (err) {
      console.log(`Error:\nExpected:${expectedInput}\nActual:${actualInput}\n${typeof actualInput}`);
      throw err;
    }

    expect(actual).toBe(expected);
  }
});
