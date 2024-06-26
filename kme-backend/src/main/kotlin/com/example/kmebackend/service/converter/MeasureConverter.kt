package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Measure
import com.example.kmebackend.model.dto.MeasureDTO
import com.example.kmebackend.model.dto.VoiceDTO
import com.example.kmebackend.repository.MeasureRepository
import com.example.kmebackend.repository.StaffRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class MeasureConverter {
    @Autowired
    private lateinit var measureRepository: MeasureRepository

    @Autowired
    private lateinit var staffRepository: StaffRepository

    @Autowired
    private lateinit var voiceConverter: VoiceConverter

    @Mapping(source = "measure", target = "voiceDTOs")
    abstract fun measureToDto(measure: Measure): MeasureDTO

    fun mapVoiceDTOs(measure: Measure): List<VoiceDTO> {
        val voices = measureRepository.getChildren(requireNotNull(measure.measureId))
        return voices.map { voiceConverter.voiceToDto(it) }
    }

    fun dtoToMeasure(measureDTO: MeasureDTO): Measure {
        val parentId = measureDTO.measureId.staffId
        val parent = staffRepository.findById(parentId).orElse(null)
        return Measure(
            measureDTO.measureId,
            parent,
            measureDTO.keySignature,
            measureDTO.timeSignature,
            measureDTO.clef,
            measureDTO.metadataJson,
        )
    }
}