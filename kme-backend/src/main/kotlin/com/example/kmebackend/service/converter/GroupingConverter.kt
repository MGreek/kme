package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Grouping
import com.example.kmebackend.model.dto.GroupingDTO
import com.example.kmebackend.model.dto.GroupingEntryDTO
import com.example.kmebackend.repository.GroupingRepository
import com.example.kmebackend.repository.VoiceRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class GroupingConverter {
    @Autowired
    private lateinit var groupingRepository: GroupingRepository

    @Autowired
    private lateinit var voiceRepository: VoiceRepository

    @Autowired
    private lateinit var groupingEntryConverter: GroupingEntryConverter

    @Mapping(source = "grouping", target = "groupingEntryDTOs")
    abstract fun groupingToDto(grouping: Grouping): GroupingDTO

    fun mapGroupingEntryDTOs(grouping: Grouping): List<GroupingEntryDTO> {
        val groupingEntries = groupingRepository.getGroupingEntries(requireNotNull(grouping.groupingId))
        return groupingEntries.map { groupingEntryConverter.groupingEntryToDto(it) }
    }

    fun dtoToGrouping(groupingDTO: GroupingDTO): Grouping {
        val parentId = groupingDTO.groupingId.voiceId
        val parent = voiceRepository.findById(parentId).orElse(null)

        return Grouping(groupingDTO.groupingId, parent, groupingDTO.metadataJson)
    }
}