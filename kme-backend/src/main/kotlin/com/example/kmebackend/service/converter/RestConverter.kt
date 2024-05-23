package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Rest
import com.example.kmebackend.model.dto.RestDTO
import org.mapstruct.Mapper

@Mapper
interface RestConverter {
    fun restToDto(rest: Rest): RestDTO
}