package com.example.kmebackend

import com.example.kmebackend.model.*
import com.example.kmebackend.service.*
import com.example.kmebackend.service.builder.ChordBuilder
import com.example.kmebackend.service.builder.StaffSystemBuilder
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.util.*
import kotlin.NoSuchElementException

@SpringBootTest
@ActiveProfiles("test")
class KmeBackendApplicationTests(
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
    @Test
    fun contextLoads() {
    }

    @Test
    fun testServices() {
        // TODO: make tests for other services as well
        // Clear all data
        staffSystemService.deleteAll()

        assertThrows<NoSuchElementException> { staffSystemService.countChildren(StaffSystemId()) }
        assertThrows<NoSuchElementException> { staffSystemService.getChildren(StaffSystemId()) }
        assertThrows<NoSuchElementException> { staffSystemService.deleteById(StaffSystemId()) }

        val staffSystem = staffSystemService.createStaffSystem(StaffSystem())
        staffSystemService.save(staffSystem)

        val staff =
            staffService.appendToStaffSystem(
                requireNotNull(staffSystem.staffSystemId),
                Staff(),
            )
        staffService.save(staff)
        assertEquals(1, staffSystemService.countChildren(requireNotNull(staffSystem.staffSystemId)))

        staffSystemService.deleteById(requireNotNull(staffSystem.staffSystemId))
        assertFalse(staffService.existsById(requireNotNull(staff.staffId)))
        assertFalse(staffSystemService.existsById(requireNotNull(staffSystem.staffSystemId)))
    }

    @Test
    fun testBuilders() {
        fun randomMetadata(): String {
            return (1..20).map { ('a'..'z').random() }.joinToString("")
        }

        // Clear all data
        staffSystemService.deleteAll()

        // StaffSystemBuilder tests
        val staffSystemBuilder =
            StaffSystemBuilder(
                staffSystemService,
                staffService,
                measureService,
                voiceService,
                groupingService,
                restService,
                chordService,
                noteService,
            )
        assertThrows<UnsupportedOperationException> { staffSystemBuilder.save() }
        assertThrows<UnsupportedOperationException> { staffSystemBuilder.getSelectedStaffSystemId() }
        assertThrows<NoSuchElementException> {
            staffSystemBuilder.selectStaffSystem(StaffSystemId(UUID.randomUUID().toString()))
        }
        assertThrows<UnsupportedOperationException> { staffSystemBuilder.buildStaves() }
        assertThrows<UnsupportedOperationException> { staffSystemBuilder.deleteSelectedStaffSystem() }

        val newStaffSystemId =
            staffSystemBuilder
                .createAndSelectStaffSystem(StaffSystem())
                .getSelectedStaffSystemId()
        assertTrue(staffSystemService.existsById(newStaffSystemId))
        staffSystemBuilder.selectStaffSystem(newStaffSystemId).deleteSelectedStaffSystem()
        assertFalse(staffSystemService.existsById(newStaffSystemId))

        val uuid = UUID.randomUUID().toString()
        val staffSystem = StaffSystem(StaffSystemId(uuid))
        staffSystemService.save(staffSystem)
        assertTrue(staffSystemService.existsById(requireNotNull(staffSystem.staffSystemId)))

        val staffSystemMetadata = "Hello System"
        staffSystemBuilder.selectStaffSystem(requireNotNull(staffSystem.staffSystemId))
            .setMetadata(staffSystemMetadata)
            .save()

        val storedStaffSystem = staffSystemService.findById(StaffSystemId(uuid)).orElseThrow()
        assertEquals(staffSystemMetadata, storedStaffSystem.metadataJson)

        // StaffBuilder tests
        val staffBuilder = staffSystemBuilder.buildStaves()
        assertEquals(staffSystemBuilder, staffBuilder.back())
        assertThrows<UnsupportedOperationException> { staffBuilder.save() }
        assertThrows<NoSuchElementException> {
            staffBuilder.selectStaff(100)
        }
        assertThrows<UnsupportedOperationException> { staffBuilder.buildMeasures() }
        assertThrows<UnsupportedOperationException> { staffBuilder.getSelectedStaffId() }
        assertThrows<UnsupportedOperationException> { staffBuilder.deleteSelectedStaff() }

        val newStaffId =
            staffBuilder
                .appendAndSelectStaff(Staff())
                .getSelectedStaffId()
        assertTrue(staffService.existsById(newStaffId))
        staffBuilder.selectStaff(newStaffId.stavesOrder).deleteSelectedStaff()
        assertFalse(staffService.existsById(newStaffId))

        val staffMetadata = randomMetadata()
        staffBuilder.appendAndSelectStaff(Staff(metadataJson = staffMetadata))
        var storedStaff = staffService.findById(requireNotNull(staffBuilder.selectedStaffId)).orElseThrow()
        assertEquals(staffMetadata, storedStaff.metadataJson)
        val otherStaffBuilder = staffSystemBuilder.buildStaves().selectStaff(0)
        assertNotEquals(staffBuilder, otherStaffBuilder)
        val newStaffMetadata = randomMetadata()
        otherStaffBuilder.setMetadata(newStaffMetadata).save()
        storedStaff = staffService.findById(requireNotNull(staffBuilder.selectedStaffId)).orElseThrow()
        assertEquals(newStaffMetadata, storedStaff.metadataJson)

        // MeasureBuilder tests
        val measureBuilder = staffBuilder.buildMeasures()
        assertEquals(staffBuilder, measureBuilder.back())
        assertThrows<UnsupportedOperationException> { measureBuilder.save() }
        assertThrows<NoSuchElementException> {
            measureBuilder.selectMeasure(100)
        }
        assertThrows<UnsupportedOperationException> { measureBuilder.buildVoices() }
        assertThrows<UnsupportedOperationException> { measureBuilder.getSelectedMeasureId() }
        assertThrows<UnsupportedOperationException> { measureBuilder.deleteSelectedMeasure() }

        val newMeasureId =
            measureBuilder
                .appendAndSelectMeasure(
                    Measure(
                        keySignature = KeySignature.Flat4,
                        timeSignature = TimeSignature.FourFour,
                        clef = Clef.Alto,
                    ),
                )
                .getSelectedMeasureId()
        assertTrue(measureService.existsById(newMeasureId))
        measureBuilder.selectMeasure(newMeasureId.measuresOrder).deleteSelectedMeasure()
        assertFalse(measureService.existsById(newMeasureId))

        val measure =
            measureService.appendToStaff(
                requireNotNull(staffBuilder.selectedStaffId),
                Measure(
                    keySignature = KeySignature.None,
                    timeSignature = TimeSignature.ThreeFour,
                    clef = Clef.Alto,
                ),
            )
        measureService.save(measure)

        val measureMetadata = "Hello Measure"
        measureBuilder.selectMeasure(0)
            .setKeySignature(KeySignature.Flat7)
            .setMetadata(measureMetadata)
            .setTimeSignature(TimeSignature.Common)
            .setClef(Clef.Treble)
            .save()

        val storedMeasure = measureService.findById(requireNotNull(measure.measureId)).orElseThrow()
        assertEquals(
            measure.copy(
                keySignature = KeySignature.Flat7,
                timeSignature = TimeSignature.Common,
                clef = Clef.Treble,
                metadataJson = measureMetadata,
            ),
            storedMeasure,
        )

        // VoiceBuilder tests
        val voiceBuilder = measureBuilder.buildVoices()
        assertEquals(measureBuilder, voiceBuilder.back())
        assertThrows<UnsupportedOperationException> { voiceBuilder.save() }
        assertThrows<NoSuchElementException> {
            voiceBuilder.selectVoice(100)
        }
        assertThrows<UnsupportedOperationException> { voiceBuilder.buildGroupings() }
        assertThrows<UnsupportedOperationException> { voiceBuilder.getSelectedVoiceId() }
        assertThrows<UnsupportedOperationException> { voiceBuilder.deleteSelectedVoice() }

        val newVoiceId =
            voiceBuilder
                .appendAndSelectVoice(Voice())
                .getSelectedVoiceId()
        assertTrue(voiceService.existsById(newVoiceId))
        voiceBuilder.selectVoice(newVoiceId.voicesOrder).deleteSelectedVoice()
        assertFalse(voiceService.existsById(newVoiceId))

        val voice =
            voiceService.appendToMeasure(
                requireNotNull(measure.measureId),
                Voice(),
            )
        voiceService.save(voice)

        val voiceMetadata = "Hello voice"
        voiceBuilder.selectVoice(0)
            .setMetadata(voiceMetadata)
            .save()

        val storedVoice = voiceService.findById(requireNotNull(voice.voiceId)).orElseThrow()
        assertEquals(
            voiceMetadata,
            storedVoice.metadataJson,
        )

        // GroupingBuilder tests
        val groupingBuilder = voiceBuilder.buildGroupings()
        assertEquals(voiceBuilder, groupingBuilder.back())
        assertThrows<UnsupportedOperationException> { groupingBuilder.save() }
        assertThrows<NoSuchElementException> {
            groupingBuilder.selectGrouping(100)
        }
        assertThrows<UnsupportedOperationException> { groupingBuilder.buildRests() }
        assertThrows<UnsupportedOperationException> { groupingBuilder.buildChords() }
        assertThrows<UnsupportedOperationException> { groupingBuilder.getSelectedGroupingId() }
        assertThrows<UnsupportedOperationException> { groupingBuilder.deleteSelectedGrouping() }

        val newGroupingId =
            groupingBuilder
                .appendAndSelectGrouping(Grouping())
                .getSelectedGroupingId()
        assertTrue(groupingService.existsById(newGroupingId))
        groupingBuilder.selectGrouping(newGroupingId.groupingsOrder).deleteSelectedGrouping()
        assertFalse(groupingService.existsById(newGroupingId))

        val grouping = groupingService.appendToVoice(requireNotNull(voice.voiceId), Grouping())
        groupingService.save(grouping)

        val groupingMetadata = "Hello Grouping"
        groupingBuilder.selectGrouping(0)
            .setMetadata(groupingMetadata)
            .save()

        val storedGrouping = groupingService.findById(requireNotNull(grouping.groupingId)).orElseThrow()
        assertEquals(groupingMetadata, storedGrouping.metadataJson)

        // RestBuilder tests
        val restBuilder = groupingBuilder.buildRests()
        assertEquals(groupingBuilder, restBuilder.back())
        assertThrows<UnsupportedOperationException> { restBuilder.save() }
        assertThrows<NoSuchElementException> {
            restBuilder.selectRest(100)
        }
        assertThrows<UnsupportedOperationException> { restBuilder.getSelectedRestId() }
        assertThrows<UnsupportedOperationException> { restBuilder.deleteSelectedRest() }

        val newRestId =
            restBuilder
                .appendAndSelectRest(Rest(position = 0, restType = RestType.Sixteenth))
                .getSelectedRestId()
        assertTrue(restService.existsById(newRestId))
        restBuilder.selectRest(newRestId.groupingEntryId.groupingEntriesOrder).deleteSelectedRest()
        assertFalse(restService.existsById(newRestId))

        val rest =
            restService.appendToGrouping(
                requireNotNull(grouping.groupingId),
                Rest(position = 0, restType = RestType.Sixtyfourth),
            )
        restService.save(rest)

        val restMetadata = "Hello Rest"
        restBuilder.selectRest(0)
            .setRestType(RestType.Sixteenth)
            .setMetadata(restMetadata)
            .save()

        val storedRest = restService.findById(requireNotNull(rest.restId)).orElseThrow()
        assertEquals(
            rest.copy(
                restType = RestType.Sixteenth,
                metadataJson = restMetadata,
            ),
            storedRest,
        )

        // ChordBuilder tests
        val chordBuilder = groupingBuilder.buildChords()
        assertEquals(groupingBuilder, chordBuilder.back())
        assertThrows<UnsupportedOperationException> { chordBuilder.save() }
        assertThrows<UnsupportedOperationException> { chordBuilder.buildNotes() }
        assertThrows<NoSuchElementException> {
            chordBuilder.selectChord(100)
        }
        assertThrows<UnsupportedOperationException> { chordBuilder.getSelectedChordId() }
        assertThrows<UnsupportedOperationException> { chordBuilder.deleteSelectedChord() }

        val newChordId =
            chordBuilder
                .appendAndSelectChord(
                    Chord(
                        stem = Stem(stemType = StemType.Thirtysecond),
                        dotCount = 0,
                    ),
                )
                .getSelectedChordId()
        assertTrue(chordService.existsById(newChordId))
        chordBuilder.selectChord(newChordId.groupingEntryId.groupingEntriesOrder).deleteSelectedChord()
        assertFalse(chordService.existsById(newChordId))

        val chord =
            chordService.appendToGrouping(
                requireNotNull(grouping.groupingId),
                Chord(
                    stem = Stem(stemType = StemType.Quarter),
                    dotCount = 1,
                ),
            )
        chordService.save(chord)

        val chordMetadata = "Hello Chord"
        val stemMetadata = "Hello Stem"
        chordBuilder.selectChord(1)
            .setStemType(StemType.Whole)
            .setStemMetadata(stemMetadata)
            .setDotCount(2)
            .setMetadata(chordMetadata)
            .save()

        val storedChord = chordService.findById(requireNotNull(chord.chordId)).orElseThrow()
        assertEquals(
            chord.copy(
                stem = Stem(stemType = StemType.Whole, metadataJson = stemMetadata),
                dotCount = 2,
                metadataJson = chordMetadata,
            ),
            storedChord,
        )

        // NoteBuilder tests
        val noteBuilder = chordBuilder.buildNotes()
        assertEquals(chordBuilder, noteBuilder.back())
        assertThrows<UnsupportedOperationException> { noteBuilder.save() }
        assertThrows<NoSuchElementException> {
            noteBuilder.selectNote(100)
        }
        assertThrows<UnsupportedOperationException> { noteBuilder.getSelectedNoteId() }
        assertThrows<UnsupportedOperationException> { noteBuilder.deleteSelectedNote() }

        val newNoteId =
            noteBuilder
                .insertAndSelectNote(
                    Note(
                        noteId = NoteId(position = 10),
                        accidental = Accidental.Flat,
                    ),
                )
                .getSelectedNoteId()
        assertTrue(noteService.existsById(newNoteId))
        noteBuilder.selectNote(newNoteId.position).deleteSelectedNote()
        assertFalse(noteService.existsById(newNoteId))

        val note =
            noteService.insertInChord(
                requireNotNull(chord.chordId),
                Note(
                    noteId = NoteId(position = 1),
                    accidental = Accidental.DoubleFlat,
                ),
            )
        noteService.save(note)

        val noteMetadata = "Hello Note"
        noteBuilder.selectNote(1)
            .setAccidental(Accidental.DoubleSharp)
            .setMetadata(noteMetadata)
            .save()

        val storedNote = noteService.findById(requireNotNull(note.noteId)).orElseThrow()
        assertEquals(
            note.copy(
                accidental = Accidental.DoubleSharp,
                metadataJson = noteMetadata,
            ),
            storedNote,
        )
    }

    @ParameterizedTest
    @ValueSource(strings = ["4c1bac9b-869d-44e2-8495-2f501f909440"])
    fun storeSheetMusic(uuid: String) {
        // Clear all data
        staffSystemService.deleteAll()

        // store measures 12 from WTC I Fuga IV
        staffSystemService.save(StaffSystem(StaffSystemId(uuid)))

        val builder =
            StaffSystemBuilder(
                staffSystemService,
                staffService,
                measureService,
                voiceService,
                groupingService,
                restService,
                chordService,
                noteService,
            )
        builder.selectStaffSystem(StaffSystemId(uuid))
            .buildStaves()
            .appendAndSelectStaff(Staff()) // Treble
            .buildMeasures()
            .appendAndSelectMeasure(
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Treble,
                ),
            )
            .buildVoices()
            .appendAndSelectVoice(Voice()) // Voice 1
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildRests()
            .appendAndSelectRest(Rest(position = 0, restType = RestType.Whole))
            .back().back()
            .appendAndSelectVoice(Voice()) // Voice 2
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildRests()
            .appendAndSelectRest(Rest(position = 0, restType = RestType.Half))
            .back()
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = 4), accidental = Accidental.None))
            .back().back().back()
            .appendAndSelectVoice(Voice()) // Voice 3
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = 0), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -1), accidental = Accidental.None))
            .back().back().back().back().back()
            .appendAndSelectStaff(Staff()) // Bass
            .buildMeasures()
            .appendAndSelectMeasure(
                Measure(
                    keySignature = KeySignature.Sharp4,
                    timeSignature = TimeSignature.Common,
                    clef = Clef.Bass,
                ),
            )
            .buildVoices()
            .appendAndSelectVoice(Voice()) // Voice 1
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 1))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -6), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -6), accidental = Accidental.Natural))
            .back().back().back()
            .appendAndSelectVoice(Voice()) // Voice 2
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildChords()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -10), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Quarter), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -9), accidental = Accidental.None))
            .back()
            .appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .buildNotes()
            .insertAndSelectNote(Note(noteId = NoteId(position = -8), accidental = Accidental.None))

        // Check that the sheet music was stored correctly
        val staffSystem = staffSystemService.findById(StaffSystemId(uuid)).orElseThrow()

        // get staves
        assertEquals(2, staffSystemService.countChildren(requireNotNull(staffSystem.staffSystemId)))
        val staves = staffSystemService.getChildren(requireNotNull(staffSystem.staffSystemId))

        val treble = staves[0]
        assertEquals(staffSystem, treble.staffSystem)

        val bass = staves[1]
        assertEquals(staffSystem, bass.staffSystem)

        // get measures
        assertEquals(staffService.countChildren(requireNotNull(treble.staffId)), 1)
        val trebleMeasure = staffService.getChildren(requireNotNull(treble.staffId))[0]
        assertEquals(treble, trebleMeasure.staff)
        assertEquals(
            Measure(
                measureId = trebleMeasure.measureId,
                staff = trebleMeasure.staff,
                keySignature = KeySignature.Sharp4,
                timeSignature = TimeSignature.Common,
                clef = Clef.Treble,
            ),
            trebleMeasure,
        )

        assertEquals(1, staffService.countChildren(requireNotNull(bass.staffId)))
        val bassMeasure = staffService.getChildren(requireNotNull(bass.staffId))[0]
        assertEquals(bass, bassMeasure.staff)
        assertEquals(
            Measure(
                measureId = bassMeasure.measureId,
                staff = bassMeasure.staff,
                keySignature = KeySignature.Sharp4,
                timeSignature = TimeSignature.Common,
                clef = Clef.Bass,
            ),
            bassMeasure,
        )

        // get voices
        // treble voices
        assertEquals(3, measureService.countChildren(requireNotNull(trebleMeasure.measureId)))
        val trebleVoices = measureService.getChildren(requireNotNull(trebleMeasure.measureId))

        val trebleVoice1 = trebleVoices[0]
        assertEquals(trebleMeasure, trebleVoice1.measure)

        val trebleVoice2 = trebleVoices[1]
        assertEquals(trebleMeasure, trebleVoice2.measure)

        val trebleVoice3 = trebleVoices[2]
        assertEquals(trebleMeasure, trebleVoice3.measure)

        // bass voices
        assertEquals(2, measureService.countChildren(requireNotNull(bassMeasure.measureId)))
        val bassVoices = measureService.getChildren(requireNotNull(bassMeasure.measureId))

        val bassVoice1 = bassVoices[0]
        assertEquals(bassMeasure, bassVoice1.measure)

        val bassVoice2 = bassVoices[1]
        assertEquals(bassMeasure, bassVoice2.measure)

        // get groupings
        assertEquals(1, voiceService.countChildren(requireNotNull(trebleVoice1.voiceId)))
        val trebleVoice1Grouping = voiceService.getChildren(requireNotNull(trebleVoice1.voiceId))[0]
        assertEquals(trebleVoice1Grouping.voice, trebleVoice1)

        assertEquals(1, voiceService.countChildren(requireNotNull(trebleVoice2.voiceId)))
        val trebleVoice2Grouping = voiceService.getChildren(requireNotNull(trebleVoice2.voiceId))[0]
        assertEquals(trebleVoice2Grouping.voice, trebleVoice2)

        assertEquals(1, voiceService.countChildren(requireNotNull(trebleVoice3.voiceId)))
        val trebleVoice3Grouping = voiceService.getChildren(requireNotNull(trebleVoice3.voiceId))[0]
        assertEquals(trebleVoice3Grouping.voice, trebleVoice3)

        assertEquals(1, voiceService.countChildren(requireNotNull(bassVoice1.voiceId)))
        val bassVoice1Grouping = voiceService.getChildren(requireNotNull(bassVoice1.voiceId))[0]
        assertEquals(bassVoice1Grouping.voice, bassVoice1)

        assertEquals(1, voiceService.countChildren(requireNotNull(bassVoice2.voiceId)))
        val bassVoice2Grouping = voiceService.getChildren(requireNotNull(bassVoice2.voiceId))[0]
        assertEquals(bassVoice2Grouping.voice, bassVoice2)

        // get rests
        assertEquals(1, groupingService.countRests(requireNotNull(trebleVoice1Grouping.groupingId)))
        val trebleVoice1Rest = groupingService.getRests(requireNotNull(trebleVoice1Grouping.groupingId))[0]
        assertEquals(trebleVoice1Grouping, requireNotNull(trebleVoice1Rest.groupingEntry).grouping)
        assertEquals(
            Rest(
                trebleVoice1Rest.restId,
                trebleVoice1Rest.groupingEntry,
                RestType.Whole,
                0,
            ),
            trebleVoice1Rest,
        )

        assertEquals(1, groupingService.countRests(requireNotNull(trebleVoice2Grouping.groupingId)))
        val trebleVoice2Rest = groupingService.getRests(requireNotNull(trebleVoice2Grouping.groupingId))[0]
        assertEquals(trebleVoice2Grouping, requireNotNull(trebleVoice2Rest.groupingEntry).grouping)
        assertEquals(
            0,
            requireNotNull(requireNotNull(trebleVoice2Rest.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Rest(
                trebleVoice2Rest.restId,
                trebleVoice2Rest.groupingEntry,
                RestType.Half,
                0,
            ),
            trebleVoice2Rest,
        )

        assertEquals(0, groupingService.countRests(requireNotNull(trebleVoice3Grouping.groupingId)))

        // get chords
        assertEquals(groupingService.countChords(requireNotNull(trebleVoice1Grouping.groupingId)), 0)

        assertEquals(groupingService.countChords(requireNotNull(trebleVoice2Grouping.groupingId)), 1)
        val trebleVoice2Chord = groupingService.getChords(requireNotNull(trebleVoice2Grouping.groupingId))[0]
        assertEquals(trebleVoice2Grouping, requireNotNull(trebleVoice2Chord.groupingEntry).grouping)
        assertEquals(
            Chord(
                chordId = trebleVoice2Chord.chordId,
                groupingEntry = trebleVoice2Chord.groupingEntry,
                stem = Stem(stemType = StemType.Half),
                dotCount = 0,
            ),
            trebleVoice2Chord,
        )

        assertEquals(groupingService.countChords(requireNotNull(trebleVoice3Grouping.groupingId)), 2)
        val trebleVoice3Chord1 = groupingService.getChords(requireNotNull(trebleVoice3Grouping.groupingId))[0]
        assertEquals(trebleVoice3Grouping, requireNotNull(trebleVoice3Chord1.groupingEntry).grouping)
        assertEquals(
            0,
            requireNotNull(requireNotNull(trebleVoice3Chord1.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = trebleVoice3Chord1.chordId,
                groupingEntry = trebleVoice3Chord1.groupingEntry,
                stem = Stem(stemType = StemType.Half),
                dotCount = 0,
            ),
            trebleVoice3Chord1,
        )

        val trebleVoice3Chord2 = groupingService.getChords(requireNotNull(trebleVoice3Grouping.groupingId))[1]
        assertEquals(trebleVoice3Grouping, requireNotNull(trebleVoice3Chord2.groupingEntry).grouping)
        assertEquals(
            1,
            requireNotNull(requireNotNull(trebleVoice3Chord2.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = trebleVoice3Chord2.chordId,
                groupingEntry = trebleVoice3Chord2.groupingEntry,
                stem = Stem(stemType = StemType.Half),
                dotCount = 0,
            ),
            trebleVoice3Chord2,
        )

        assertEquals(2, groupingService.countChords(requireNotNull(bassVoice1Grouping.groupingId)))
        val bassVoice1Chord1 = groupingService.getChords(requireNotNull(bassVoice1Grouping.groupingId))[0]
        assertEquals(requireNotNull(bassVoice1Chord1.groupingEntry).grouping, bassVoice1Grouping)
        assertEquals(
            0,
            requireNotNull(requireNotNull(bassVoice1Chord1.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = bassVoice1Chord1.chordId,
                groupingEntry = bassVoice1Chord1.groupingEntry,
                stem = Stem(stemType = StemType.Half),
                dotCount = 1,
            ),
            bassVoice1Chord1,
        )

        val bassVoice1Chord2 = groupingService.getChords(requireNotNull(bassVoice1Grouping.groupingId))[1]
        assertEquals(requireNotNull(bassVoice1Chord2.groupingEntry).grouping, bassVoice1Grouping)
        assertEquals(
            1,
            requireNotNull(requireNotNull(bassVoice1Chord2.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = bassVoice1Chord2.chordId,
                groupingEntry = bassVoice1Chord2.groupingEntry,
                stem = Stem(stemType = StemType.Quarter),
                dotCount = 0,
            ),
            bassVoice1Chord2,
        )

        assertEquals(3, groupingService.countChords(requireNotNull(bassVoice2Grouping.groupingId)))
        val bassVoice2Chord1 = groupingService.getChords(requireNotNull(bassVoice2Grouping.groupingId))[0]
        assertEquals(requireNotNull(bassVoice2Chord1.groupingEntry).grouping, bassVoice2Grouping)
        assertEquals(
            0,
            requireNotNull(requireNotNull(bassVoice2Chord1.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = bassVoice2Chord1.chordId,
                groupingEntry = bassVoice2Chord1.groupingEntry,
                stem = Stem(stemType = StemType.Quarter),
                dotCount = 0,
            ),
            bassVoice2Chord1,
        )

        val bassVoice2Chord2 = groupingService.getChords(requireNotNull(bassVoice2Grouping.groupingId))[1]
        assertEquals(requireNotNull(bassVoice2Chord2.groupingEntry).grouping, bassVoice2Grouping)
        assertEquals(
            1,
            requireNotNull(requireNotNull(bassVoice2Chord2.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = bassVoice2Chord2.chordId,
                groupingEntry = bassVoice2Chord2.groupingEntry,
                stem = Stem(stemType = StemType.Quarter),
                dotCount = 0,
            ),
            bassVoice2Chord2,
        )

        val bassVoice2Chord3 = groupingService.getChords(requireNotNull(bassVoice2Grouping.groupingId))[2]
        assertEquals(requireNotNull(bassVoice2Chord3.groupingEntry).grouping, bassVoice2Grouping)
        assertEquals(
            2,
            requireNotNull(requireNotNull(bassVoice2Chord3.groupingEntry).groupingEntryId).groupingEntriesOrder,
        )
        assertEquals(
            Chord(
                chordId = bassVoice2Chord3.chordId,
                groupingEntry = bassVoice2Chord3.groupingEntry,
                stem = Stem(stemType = StemType.Half),
                dotCount = 0,
            ),
            bassVoice2Chord3,
        )

        // get notes
        assertEquals(1, chordService.countChildren(requireNotNull(trebleVoice2Chord.chordId)))
        val trebleVoice2Note = chordService.getChildren(requireNotNull(trebleVoice2Chord.chordId))[0]
        assertEquals(requireNotNull(trebleVoice2Chord.chordId), trebleVoice2Note.noteId.chordId)
        assertEquals(4, trebleVoice2Note.noteId.position)
        assertEquals(
            Note(
                noteId = trebleVoice2Note.noteId,
                chord = trebleVoice2Chord,
                accidental = Accidental.None,
            ),
            trebleVoice2Note,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(trebleVoice3Chord1.chordId)))
        val trebleVoice3Note1 = chordService.getChildren(requireNotNull(trebleVoice3Chord1.chordId))[0]
        assertEquals(requireNotNull(trebleVoice3Chord1.chordId), trebleVoice3Note1.noteId.chordId)
        assertEquals(0, trebleVoice3Note1.noteId.position)
        assertEquals(
            Note(
                noteId = trebleVoice3Note1.noteId,
                chord = trebleVoice3Chord1,
                accidental = Accidental.None,
            ),
            trebleVoice3Note1,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(trebleVoice3Chord2.chordId)))
        val trebleVoice3Note2 = chordService.getChildren(requireNotNull(trebleVoice3Chord2.chordId))[0]
        assertEquals(requireNotNull(trebleVoice3Chord2.chordId), trebleVoice3Note2.noteId.chordId)
        assertEquals(-1, trebleVoice3Note2.noteId.position)
        assertEquals(
            Note(
                noteId = trebleVoice3Note2.noteId,
                chord = trebleVoice3Chord2,
                accidental = Accidental.None,
            ),
            trebleVoice3Note2,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(bassVoice1Chord1.chordId)))
        val bassVoice1Note1 = chordService.getChildren(requireNotNull(bassVoice1Chord1.chordId))[0]
        assertEquals(requireNotNull(bassVoice1Chord1.chordId), bassVoice1Note1.noteId.chordId)
        assertEquals(-6, bassVoice1Note1.noteId.position)
        assertEquals(
            Note(
                noteId = bassVoice1Note1.noteId,
                chord = bassVoice1Chord1,
                accidental = Accidental.None,
            ),
            bassVoice1Note1,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(bassVoice1Chord2.chordId)))
        val bassVoice1Note2 = chordService.getChildren(requireNotNull(bassVoice1Chord2.chordId))[0]
        assertEquals(requireNotNull(bassVoice1Chord2.chordId), bassVoice1Note2.noteId.chordId)
        assertEquals(-6, bassVoice1Note2.noteId.position)
        assertEquals(
            Note(
                noteId = bassVoice1Note2.noteId,
                chord = bassVoice1Chord2,
                accidental = Accidental.Natural,
            ),
            bassVoice1Note2,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(bassVoice2Chord1.chordId)))
        val bassVoice2Note1 = chordService.getChildren(requireNotNull(bassVoice2Chord1.chordId))[0]
        assertEquals(requireNotNull(bassVoice2Chord1.chordId), bassVoice2Note1.noteId.chordId)
        assertEquals(-10, bassVoice2Note1.noteId.position)
        assertEquals(
            Note(
                noteId = bassVoice2Note1.noteId,
                chord = bassVoice2Chord1,
                accidental = Accidental.None,
            ),
            bassVoice2Note1,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(bassVoice2Chord2.chordId)))
        val bassVoice2Note2 = chordService.getChildren(requireNotNull(bassVoice2Chord2.chordId))[0]
        assertEquals(requireNotNull(bassVoice2Chord2.chordId), bassVoice2Note2.noteId.chordId)
        assertEquals(-9, bassVoice2Note2.noteId.position)
        assertEquals(
            Note(
                noteId = bassVoice2Note2.noteId,
                chord = bassVoice2Chord2,
                accidental = Accidental.None,
            ),
            bassVoice2Note2,
        )

        assertEquals(1, chordService.countChildren(requireNotNull(bassVoice2Chord3.chordId)))
        val bassVoice2Note3 = chordService.getChildren(requireNotNull(bassVoice2Chord3.chordId))[0]
        assertEquals(requireNotNull(bassVoice2Chord3.chordId), bassVoice2Note3.noteId.chordId)
        assertEquals(-8, bassVoice2Note3.noteId.position)
        assertEquals(
            Note(
                noteId = bassVoice2Note3.noteId,
                chord = bassVoice2Chord3,
                accidental = Accidental.None,
            ),
            bassVoice2Note3,
        )
    }

    @Test
    fun testECPBVA() {
        // Clear all data
        staffSystemService.deleteAll()

        val staffSystemBuilder =
            StaffSystemBuilder(
                staffSystemService,
                staffService,
                measureService,
                voiceService,
                groupingService,
                restService,
                chordService,
                noteService,
            )

        val chordBuilder =
            staffSystemBuilder.createAndSelectStaffSystem(StaffSystem())
                .buildStaves().appendAndSelectStaff(Staff())
                .buildMeasures().appendAndSelectMeasure(
                    Measure(
                        clef = Clef.Treble,
                        keySignature = KeySignature.Sharp3,
                        timeSignature = TimeSignature.TwoFour,
                    ),
                )
                .buildVoices().appendAndSelectVoice(Voice())
                .buildGroupings().appendAndSelectGrouping(Grouping())
                .buildChords()

        assertThrows<Exception> {
            chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = Long.MIN_VALUE))
        }
        assertThrows<Exception> {
            chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = -1))
        }
        assertThrows<Exception> {
            chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 5))
        }
        assertThrows<Exception> {
            chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = Long.MAX_VALUE))
        }
        assertDoesNotThrow {
            chordBuilder.appendAndSelectChord(
                Chord(stem = Stem(stemType = StemType.Half), dotCount = 0),
            )
        }
        assertDoesNotThrow {
            chordBuilder.appendAndSelectChord(
                Chord(stem = Stem(stemType = StemType.Half), dotCount = 4),
            )
        }

        fun checkCurrentChord(
            chordBuilder: ChordBuilder,
            expectedChord: Chord,
        ) {
            val chord =
                chordService.findById(
                    chordBuilder.getSelectedChordId(),
                ).orElseThrow().copy(chordId = null, groupingEntry = null)
            assertEquals(expectedChord, chord)
        }

        chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .setMetadata("Hello Chord")
            .save()
        checkCurrentChord(
            chordBuilder,
            Chord(stem = Stem(stemType = StemType.Half), dotCount = 0, metadataJson = "Hello Chord"),
        )

        chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .setDotCount(2)
            .save()
        checkCurrentChord(chordBuilder, Chord(stem = Stem(stemType = StemType.Half), dotCount = 2))

        chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .setStemMetadata("Hello Stem")
            .save()
        checkCurrentChord(
            chordBuilder,
            Chord(stem = Stem(stemType = StemType.Half, metadataJson = "Hello Stem"), dotCount = 0),
        )

        chordBuilder.appendAndSelectChord(Chord(stem = Stem(stemType = StemType.Half), dotCount = 0))
            .setStemType(StemType.Sixteenth)
            .save()
        checkCurrentChord(chordBuilder, Chord(stem = Stem(stemType = StemType.Sixteenth), dotCount = 0))
    }
}