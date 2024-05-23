package com.example.kmebackend

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.MeasureDTO
import com.example.kmebackend.model.dto.StaffDTO
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.service.MeasureService
import com.example.kmebackend.service.StaffService
import com.example.kmebackend.service.StaffSystemService
import com.example.kmebackend.service.converter.StaffSystemConverter
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class DTOTests(
    @Autowired
    val staffSystemConverter: StaffSystemConverter,
    @Autowired
    val staffSystemService: StaffSystemService,
    @Autowired
    val staffService: StaffService,
    @Autowired
    val measureService: MeasureService,
) {
    @AfterEach
    fun tearDown() {
        staffSystemService.deleteAll()
    }

    @Test
    fun contextLoads() {
    }

    @Test
    fun staffSystemConverterToDtoTest() {
        val staffSystem =
            staffSystemService.createStaffSystem(
                StaffSystem(metadataJson = "Hello System"),
            )
        staffSystemService.save(staffSystem)
        val staff =
            staffService.appendToStaffSystem(
                requireNotNull(staffSystem.staffSystemId),
                Staff(metadataJson = "Hello Staff"),
            )
        staffService.save(staff)
        val measure =
            measureService.appendToStaff(
                requireNotNull(staff.staffId),
                Measure(
                    keySignature = KeySignature.Sharp3,
                    timeSignature = TimeSignature.TwoFour,
                    clef = Clef.Alto,
                    metadataJson = "Hello Measure",
                ),
            )
        measureService.save(measure)
        val staffSystemDTO = staffSystemConverter.staffSystemToDto(staffSystem)
        assertEquals(
            StaffSystemDTO(
                staffSystemId = requireNotNull(staffSystem.staffSystemId),
                metadataJson = "Hello System",
                staffDTOs =
                    listOf(
                        StaffDTO(
                            staffId = requireNotNull(staff.staffId),
                            metadataJson = "Hello Staff",
                            measureDTOs =
                                listOf(
                                    MeasureDTO(
                                        measureId = requireNotNull(measure.measureId),
                                        metadataJson = "Hello Measure",
                                        keySignature = KeySignature.Sharp3,
                                        timeSignature = TimeSignature.TwoFour,
                                        clef = Clef.Alto,
                                        voiceDTOs = emptyList(),
                                    ),
                                ),
                        ),
                    ),
            ),
            staffSystemDTO,
        )
    }
}