package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Stem
import com.example.kmebackend.model.dto.StemDTO
import org.mapstruct.Mapper

@Mapper
abstract class StemConverter {
    abstract fun stemToDto(stem: Stem): StemDTO

    fun dtoToStem(stemDTO: StemDTO): Stem {
        return Stem(stemDTO.stemType, stemDTO.metadataJson)
    }
}