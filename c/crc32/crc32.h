#ifndef _CRC32_H
#define _CRC32_H

#include <stdint.h>

uint32_t crc32_update(uint32_t crc, uint8_t data);
uint32_t crc32(const uint8_t * v, uint8_t len);

#endif

