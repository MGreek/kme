package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Chord
import com.example.kmebackend.model.Stem
import com.example.kmebackend.model.dto.ChordDTO
import com.example.kmebackend.model.dto.NoteDTO
import com.example.kmebackend.model.dto.StemDTO
import com.example.kmebackend.repository.ChordRepository
import com.example.kmebackend.repository.GroupingEntryRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class ChordConverter {
    @Autowired
    private lateinit var chordRepository: ChordRepository

    @Autowired
    private lateinit var groupingEntryRepository: GroupingEntryRepository

    @Autowired
    private lateinit var stemConverter: StemConverter

    @Autowired
    private lateinit var noteConverter: NoteConverter

    @Mapping(source = "stem", target = "stemDTO")
    @Mapping(source = "chord", target = "noteDTOs")
    abstract fun chordToDto(chord: Chord): ChordDTO

    fun mapStemDTO(stem: Stem): StemDTO {
        return stemConverter.stemToDto(stem)
    }

    fun mapNoteDTOs(chord: Chord): List<NoteDTO> {
        val notes = chordRepository.getChildren(requireNotNull(chord.chordId))
        return notes.map { noteConverter.noteToDto(it) }
    }

    fun dtoToChord(chordDTO: ChordDTO): Chord {
        val parentId = chordDTO.chordId.groupingEntryId
        val parent = groupingEntryRepository.findById(parentId).orElse(null)

        return Chord(
            chordDTO.chordId,
            parent,
            stemConverter.dtoToStem(chordDTO.stemDTO),
            chordDTO.dotCount,
            chordDTO.metadataJson,
        )
    }
}