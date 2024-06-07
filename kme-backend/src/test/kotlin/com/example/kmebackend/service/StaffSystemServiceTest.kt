package com.example.kmebackend.service

import com.example.kmebackend.model.*
import com.example.kmebackend.model.dto.StaffDTO
import com.example.kmebackend.model.dto.StaffSystemDTO
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
class StaffSystemServiceTest(
    @Autowired
    val staffSystemService: StaffSystemService,
    @Autowired
    val staffService: StaffService,
    @Autowired
    val measureService: MeasureService,
    @Autowired
    val voiceService: VoiceService,
    @Autowired
    val groupingService: GroupingService,
    @Autowired
    val restService: RestService,
    @Autowired
    val chordService: ChordService,
    @Autowired
    val noteService: NoteService,
) {
    @BeforeEach
    fun setUp() {
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
    }

    @AfterEach
    fun tearDown() {
        noteService.deleteAll()
        chordService.deleteAll()
        restService.deleteAll()
        groupingService.deleteAll()
        voiceService.deleteAll()
        measureService.deleteAll()
        staffService.deleteAll()
        staffSystemService.deleteAll()
    }

    @Test
    fun saveDTO() {
        val staffSystem = staffSystemService.findAll().first()
        val staffDTO1 = StaffDTO(StaffId(requireNotNull(staffSystem.staffSystemId), 0), "Staff 1", emptyList())
        val staffDTO2 = StaffDTO(StaffId(requireNotNull(staffSystem.staffSystemId), 1), "Staff 2", emptyList())
        val staffSystemDTO =
            StaffSystemDTO(
                requireNotNull(staffSystem.staffSystemId),
                staffSystem.metadataJson,
                listOf(staffDTO1, staffDTO2),
            )

        staffSystemService.saveDTO(staffSystemDTO)
        assertEquals(1, staffSystemService.findAll().size)
        assertEquals(2, staffSystemService.getChildren(requireNotNull(staffSystem.staffSystemId)).size)
        assertEquals(
            0,
            staffSystemService.getChildren(requireNotNull(staffSystem.staffSystemId)).flatMap {
                staffService.getChildren(requireNotNull(it.staffId))
            }.size,
        )
    }
}