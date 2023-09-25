/*
 * SPDX-FileCopyrightText: 2021 lovasoa <https://github.com/lovasoa/base45-ts>
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Encode binary data to base45
 * @param byteArrayArg An array of bytes to encode
 * @returns a base45-encoded string
 */
export declare function encode(byteArrayArg: Uint8Array | number[]): string;
/**
 * Decode a base45-encoded string
 * @param utf8StringArg A base45-encoded string
 * @returns a typed array containing the decoded data
 */
export declare function decode(utf8StringArg: string): Uint8Array;
/**
 * Same as decode, but returns a string instead of a typed array.
 * If the base45-encoded data was not valid UTF-8, throws an error.
 * @param utf8StringArg base45-encoded string representing an utf8 string
 * @returns the decoded string
 */
export declare function decodeToUtf8String(utf8StringArg: string): string;
//# sourceMappingURL=base45.d.ts.map