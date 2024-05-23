package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Stem
import com.example.kmebackend.model.dto.StemDTO
import org.mapstruct.Mapper

@Mapper
interface StemConverter {
    fun stemToDto(stem: Stem): StemDTO
}