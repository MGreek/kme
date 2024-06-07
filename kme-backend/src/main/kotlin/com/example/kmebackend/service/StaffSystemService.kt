package com.example.kmebackend.service

import com.example.kmebackend.model.Staff
import com.example.kmebackend.model.StaffSystem
import com.example.kmebackend.model.StaffSystemId
import com.example.kmebackend.model.dto.StaffSystemDTO
import com.example.kmebackend.repository.*
import com.example.kmebackend.service.converter.*
import org.springframework.stereotype.Service
import java.util.*
import kotlin.NoSuchElementException

// TODO: make use of repo instead of service (here and in the rest of the Service classes)
@Service
data class StaffSystemService(
    val staffSystemConverter: StaffSystemConverter,
    val staffConverter: StaffConverter,
    val measureConverter: MeasureConverter,
    val voiceConverter: VoiceConverter,
    val groupingConverter: GroupingConverter,
    val groupingEntryConverter: GroupingEntryConverter,
    val restConverter: RestConverter,
    val chordConverter: ChordConverter,
    val noteConverter: NoteConverter,
    val staffRepository: StaffRepository,
    val measureRepository: MeasureRepository,
    val voiceRepository: VoiceRepository,
    val groupingRepository: GroupingRepository,
    val groupingEntryRepository: GroupingEntryRepository,
    val restRepository: RestRepository,
    val chordRepository: ChordRepository,
    val noteRepository: NoteRepository,
    val staffService: StaffService,
    val staffSystemRepository: StaffSystemRepository,
) {
    /**
     * A wrapper around StaffSystemRepository::save
     */
    fun save(staffSystem: StaffSystem): StaffSystem {
        return staffSystemRepository.save(staffSystem)
    }

    /**
     * A wrapper around StaffSystemRepository::findAll
     */
    fun findAll(): List<StaffSystem> {
        return staffSystemRepository.findAll()
    }

    /**
     * A wrapper around StaffSystemRepository::findById
     */
    fun findById(staffSystemId: StaffSystemId): Optional<StaffSystem> {
        return staffSystemRepository.findById(staffSystemId)
    }

    /**
     * A wrapper around StaffSystemRepository::existsById
     */
    fun existsById(staffSystemId: StaffSystemId): Boolean {
        return staffSystemRepository.existsById(staffSystemId)
    }

    /**
     * Creates a new StaffSystem.
     * @param staffSystem the instance from where data is copied to the new StaffSystem. Its ID is ignored.
     * @return a new StaffSystem.
     */
    fun createStaffSystem(staffSystem: StaffSystem): StaffSystem {
        return staffSystem.copy(staffSystemId = StaffSystemId())
    }

    /**
     * @param staffSystemId the id of the StaffSystem.
     * @return the number of children of the StaffSystem corresponding to staffSystemId.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun countChildren(staffSystemId: StaffSystemId): Int {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.countChildren(staffSystemId)
    }

    /**
     * @param staffSystemId the id of the StaffSystem.
     * @return the children of the StaffSystem corresponding to staffSystemId.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun getChildren(staffSystemId: StaffSystemId): List<Staff> {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        return staffSystemRepository.getChildren(staffSystemId)
    }

    /**
     * Deletes all StaffSystem entities and their children.
     */
    fun deleteAll() {
        staffService.deleteAll()
        staffSystemRepository.deleteAll()
    }

    /**
     * Deletes the StaffSystem corresponding to staffSystemId and its children.
     * @param staffSystemId the ID of the StaffSystem to be deleted.
     * @throws NoSuchElementException if staffSystemId doesn't correspond to a StaffSystem.
     */
    fun deleteById(staffSystemId: StaffSystemId) {
        if (!existsById(staffSystemId)) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }
        val children = getChildren(staffSystemId)
        for (child in children) {
            staffService.deleteById(requireNotNull(child.staffId))
        }
        staffSystemRepository.deleteById(staffSystemId)
    }

    /**
     * Overrides the data of an existing [StaffSystem] with the data of a [StaffSystemDTO].
     * @param staffSystemDTO the DTO from where data is saved.
     * @throws NoSuchElementException if the ID provided by [staffSystemDTO] is not found.
     */
    fun saveDTO(staffSystemDTO: StaffSystemDTO) {
        val staffSystemId = staffSystemDTO.staffSystemId

        if (staffSystemRepository.findById(staffSystemId).isEmpty) {
            throw NoSuchElementException("StaffSystem with ID $staffSystemId not found")
        }

        val staves = staffSystemRepository.getChildren(staffSystemId)
        val measures = staves.map { staffRepository.getChildren(requireNotNull(it.staffId)) }.flatten()
        val voices = measures.map { measureRepository.getChildren(requireNotNull(it.measureId)) }.flatten()
        val groupings = voices.map { voiceRepository.getChildren(requireNotNull(it.voiceId)) }.flatten()
        val groupingEntries =
            groupings.map {
                groupingRepository.getGroupingEntries(
                    requireNotNull(it.groupingId),
                )
            }.flatten()
        val rests =
            groupingEntries.filter { groupingEntryRepository.getRest(requireNotNull(it.groupingEntryId)) != null }.map {
                requireNotNull(
                    groupingEntryRepository.getRest(
                        requireNotNull(it.groupingEntryId),
                    ),
                )
            }
        val chords =
            groupingEntries.filter { groupingEntryRepository.getRest(requireNotNull(it.groupingEntryId)) != null }.map {
                requireNotNull(
                    groupingEntryRepository.getChord(
                        requireNotNull(it.groupingEntryId),
                    ),
                )
            }
        val notes = chords.map { chordRepository.getChildren(requireNotNull(it.chordId)) }.flatten()

        notes.map { requireNotNull(it.noteId) }.forEach(noteRepository::deleteById)
        chords.map { requireNotNull(it.chordId) }.forEach(chordRepository::deleteById)
        rests.map { requireNotNull(it.restId) }.forEach(restRepository::deleteById)
        groupingEntries.map { requireNotNull(it.groupingEntryId) }.forEach(groupingEntryRepository::deleteById)
        groupings.map { requireNotNull(it.groupingId) }.forEach(groupingRepository::deleteById)
        voices.map { requireNotNull(it.voiceId) }.forEach(voiceRepository::deleteById)
        measures.map { requireNotNull(it.measureId) }.forEach(measureRepository::deleteById)
        staves.map { requireNotNull(it.staffId) }.forEach(staffRepository::deleteById)
        deleteById(staffSystemId)

        val staffDTOs = staffSystemDTO.staffDTOs
        val measureDTOs = staffDTOs.flatMap { it.measureDTOs }
        val voiceDTOs = measureDTOs.flatMap { it.voiceDTOs }
        val groupingDTOs = voiceDTOs.flatMap { it.groupingDTOs }
        val groupingEntryDTOs = groupingDTOs.flatMap { it.groupingEntryDTOs }
        val restDTOs = groupingEntryDTOs.filter { it.restDTO != null }.map { requireNotNull(it.restDTO) }
        val chordDTOs = groupingEntryDTOs.filter { it.chordDTO != null }.map { requireNotNull(it.chordDTO) }
        val noteDTOs = chordDTOs.flatMap { it.noteDTOs }

        staffSystemRepository.save(staffSystemConverter.dtoToStaffSystem(staffSystemDTO))
        staffDTOs.map { staffConverter.dtoToStaff(it) }.forEach(staffRepository::save)
        measureDTOs.map { measureConverter.dtoToMeasure(it) }.forEach(measureRepository::save)
        voiceDTOs.map { voiceConverter.dtoToVoice(it) }.forEach(voiceRepository::save)
        groupingDTOs.map { groupingConverter.dtoToGrouping(it) }.forEach(groupingRepository::save)
        groupingEntryDTOs.map { groupingEntryConverter.dtoToGroupingEntry(it) }.forEach(groupingEntryRepository::save)
        restDTOs.map { restConverter.dtoToRest(it) }.forEach(restRepository::save)
        chordDTOs.map { chordConverter.dtoToChord(it) }.forEach(chordRepository::save)
        noteDTOs.map { noteConverter.dtoToNote(it) }.forEach(noteRepository::save)
    }
}