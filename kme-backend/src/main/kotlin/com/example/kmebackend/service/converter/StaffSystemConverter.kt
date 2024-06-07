package com.example.kmebackend.service.converter

import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.dto.StaffDTO
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.repository.StaffSystemRepository
import org.mapstruct.Mapper
import org.mapstruct.Mapping
import org.springframework.beans.factory.annotation.Autowired

@Mapper
abstract class StaffSystemConverter {
    @Autowired
    private lateinit var staffSystemRepository: StaffSystemRepository

    @Autowired
    private lateinit var staffConverter: StaffConverter

    @Mapping(source = "staffSystem", target = "staffDTOs")
    abstract fun staffSystemToDto(staffSystem: StaffSystem): StaffSystemDTO

    fun mapStaffDTOs(staffSystem: StaffSystem): List<StaffDTO> {
        val staves = staffSystemRepository.getChildren(requireNotNull(staffSystem.staffSystemId))
        return staves.map { staffConverter.staffToDto(it) }
    }

    fun dtoToStaffSystem(staffSystemDTO: StaffSystemDTO): StaffSystem {
        return StaffSystem(staffSystemId = staffSystemDTO.staffSystemId, metadataJson = staffSystemDTO.metadataJson)
    }
}