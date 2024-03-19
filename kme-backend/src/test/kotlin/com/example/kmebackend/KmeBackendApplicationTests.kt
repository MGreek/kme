package com.example.kmebackend

import com.example.kmebackend.model.*
import com.example.kmebackend.service.*
import com.example.kmebackend.service.builder.StaffSystemBuilder
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
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

    @ParameterizedTest
    @ValueSource(strings = ["4c1bac9b-869d-44e2-8495-2f501f909440"])
    fun storeSheetMusic(uuid: String) {
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
            .appendAndSelectRest(Rest(restType = RestType.Whole))
            .back().back()
            .appendAndSelectVoice(Voice()) // Voice 2
            .buildGroupings()
            .appendAndSelectGrouping(Grouping())
            .buildRests()
            .appendAndSelectRest(Rest(restType = RestType.Half))
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
}
