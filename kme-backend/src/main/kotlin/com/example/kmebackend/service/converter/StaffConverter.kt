package com.example.kmebackend.service.converter

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.dto.MeasureDTO
import com.example.kmebackend.model.dto.StaffDTO
import com.example.kmebackend.repository.StaffRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class StaffConverter {
    @Autowired
    private lateinit var staffRepository: StaffRepository

    @Autowired
    private lateinit var measureConverter: MeasureConverter

    @Mapping(source = "staff", target = "measureDTOs")
    abstract fun staffToDto(staff: Staff): StaffDTO

    fun mapMeasureDTOs(staff: Staff): List<MeasureDTO> {
        val measures = staffRepository.getChildren(requireNotNull(staff.staffId))
        return measures.map { measureConverter.measureToDto(it) }
    }
}