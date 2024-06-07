package com.example.kmebackend.service.converter

import com.example.kmebackend.model.GroupingEntry
import com.example.kmebackend.model.dto.ChordDTO
import com.example.kmebackend.model.dto.GroupingEntryDTO
import com.example.kmebackend.model.dto.RestDTO
import com.example.kmebackend.repository.GroupingEntryRepository
import com.example.kmebackend.repository.GroupingRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class GroupingEntryConverter {
    @Autowired
    private lateinit var groupingEntryRepository: GroupingEntryRepository

    @Autowired
    private lateinit var groupingRepository: GroupingRepository

    @Autowired
    private lateinit var restConverter: RestConverter

    @Autowired
    private lateinit var chordConverter: ChordConverter

    @Mapping(source = "groupingEntry", target = "restDTO")
    @Mapping(source = "groupingEntry", target = "chordDTO")
    abstract fun groupingEntryToDto(groupingEntry: GroupingEntry): GroupingEntryDTO

    fun mapRestDTO(groupingEntry: GroupingEntry): RestDTO? {
        val rest = groupingEntryRepository.getRest(requireNotNull(groupingEntry.groupingEntryId))
        return if (rest != null) restConverter.restToDto(rest) else null
    }

    fun mapChordDTO(groupingEntry: GroupingEntry): ChordDTO? {
        val chord = groupingEntryRepository.getChord(requireNotNull(groupingEntry.groupingEntryId))
        return if (chord != null) chordConverter.chordToDto(chord) else null
    }

    fun dtoToGroupingEntry(groupingEntryDTO: GroupingEntryDTO): GroupingEntry {
        val parentId = groupingEntryDTO.groupingEntryId.groupingId
        val parent = groupingRepository.findById(parentId).orElse(null)

        return GroupingEntry(groupingEntryDTO.groupingEntryId, parent)
    }
}