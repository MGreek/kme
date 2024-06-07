package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Voice
import com.example.kmebackend.model.dto.GroupingDTO
import com.example.kmebackend.model.dto.VoiceDTO
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.VoiceRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class VoiceConverter {
    @Autowired
    private lateinit var voiceRepository: VoiceRepository

    @Autowired
    private lateinit var measureRepository: MeasureRepository

    @Autowired
    private lateinit var groupingConverter: GroupingConverter

    @Mapping(source = "voice", target = "groupingDTOs")
    abstract fun voiceToDto(voice: Voice): VoiceDTO

    fun mapGroupingDTOs(voice: Voice): List<GroupingDTO> {
        val groupings = voiceRepository.getChildren(requireNotNull(voice.voiceId))
        return groupings.map { groupingConverter.groupingToDto(it) }
    }

    fun dtoToVoice(voiceDTO: VoiceDTO): Voice {
        val parentId = voiceDTO.voiceId.measureId
        val parent = measureRepository.findById(parentId).orElse(null)

        return Voice(voiceDTO.voiceId, parent, voiceDTO.metadataJson)
    }
}