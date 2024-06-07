package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Rest
import com.example.kmebackend.model.dto.RestDTO
import com.example.kmebackend.repository.GroupingEntryRepository
import org.mapstruct.Mapper
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class RestConverter {
    @Autowired
    private lateinit var groupingEntryRepository: GroupingEntryRepository

    abstract fun restToDto(rest: Rest): RestDTO

    fun dtoToRest(restDTO: RestDTO): Rest {
        val parentId = restDTO.restId.groupingEntryId
        val parent = groupingEntryRepository.findById(parentId).orElse(null)

        return Rest(restDTO.restId, parent, restDTO.restType, restDTO.position, restDTO.metadataJson)
    }
}